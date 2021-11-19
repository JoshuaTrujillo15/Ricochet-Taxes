const axios = require('axios')
const BigNumber = require('bignumber.js')
const { contracts, maticSubgraph, stables } = require('./constants')

// ----- ----- -----
// HELPERS
// ----- ----- -----
const bigZero = new BigNumber(0) // lol
const unitAdjustment = new BigNumber('1000000000')
const decimalAdjustment = new BigNumber('1000000000000000000')
const ROUND_DOWN = 1

function adjustForDecimal(value) {
	return value.dividedBy(decimalAdjustment).toFixed(18)
}
// unitsOwned = flowRate * 1e-9
// https://github.com/Ricochet-Exchange/ricochet/blob/e1daf6e8380733566cf84e921a373864444d6b3b/01-Contracts/contracts/StreamExchangeHelper.sol#L327
function adjustForUnits(flowRate) {
	return flowRate.dividedBy(unitAdjustment).integerValue(ROUND_DOWN)
}

// check if flow has closed between the two timestamps
function flowHasClosed(flowUpdates, startTime, endTime) {
	const flowUpdatesInTimeFrame = flowUpdates.filter(
		f => f.timestamp > startTime || f.timestamp < endTime
	)
	const hasClosed = flowUpdatesInTimeFrame.findIndex(f => f.type === 2) === -1
	return hasClosed
}

function streamsToStableCoin(contract) {
	return contract.market.endsWith('DAI') || contract.market.endsWith('USDC')
}

// ----- ----- -----
// GRAPHQL QUERY BUILDERS
// ----- ----- -----

const buildFlowUpdateQuery = (
	walletAddress,
	contractAddress,
	timestampPaginator
) =>
	`query{
    flowUpdatedEvents (
        first:1000
        orderBy: timestamp
        where: {
            sender: "${walletAddress}"
            receiver: "${contractAddress}"
            timestamp_gt: ${timestampPaginator}
        }
    ) {
        id
        timestamp
		flowRate
        oldFlowRate
        type
    }
}`

const buildDistributionQuery = (contractAddress, timestampPaginator) =>
	`query {
    indexUpdatedEvents(
        first: 1000
        orderBy: timestamp
        where: {
            indexId: "0"
            publisher: "${contractAddress}"
            timestamp_gt: ${timestampPaginator}
        }
    ) {
        timestamp
        oldIndexValue
        newIndexValue
    }
}`

// ----- ----- -----
// QUERY FUNCTIONS
// ----- ----- -----

async function getFlowUpdates(walletAddress, contractAddress) {
	let allFlowUpdates = []
	let timestamp = 0
	while (true) {
		try {
			const query = buildFlowUpdateQuery(
				walletAddress.toLowerCase(),
				contractAddress.toLowerCase(),
				timestamp
			)
			const result = await axios.post(maticSubgraph, { query })
			const { flowUpdatedEvents: flowUpdates } = result.data.data
			allFlowUpdates.push(...flowUpdates)
			if (flowUpdates.length < 1000) break
			timestamp = flowUpdates[flowUpdates.length - 1].timestamp
		} catch (error) {
			throw error
		}
	}
	return allFlowUpdates
}

async function getDistributions(contractAddress, timestampPaginator = 0) {
	let allDistributions = []
	// timestamp paginator can be set to first flowUpdateEvent.timestamp,
	// as no distributions should be called to the address before this.
	// also, minus 1 because `timestamp_gte` complicates things more than
	// `timestamp_gt`. It is extraordinarily unlikely that two subsequent blocks
	// will be 1 second apart.
	let timestamp = timestampPaginator - 1
	while (true) {
		try {
			const query = buildDistributionQuery(
				contractAddress.toLowerCase(),
				timestamp
			)
			const result = await axios.post(maticSubgraph, { query })
			const { indexUpdatedEvents: distributions } = result.data.data
			allDistributions.push(...distributions)
			if (distributions.length < 1000) break
			timestamp = distributions[distributions.length - 1].timestamp
		} catch (error) {
			throw error
		}
	}
	return allDistributions
}

function computeSwaps(flowUpdates, distributions, toStable) {
	// sanity check
	if (distributions[0].timestamp !== flowUpdates[0].timestamp) {
		throw new Error(
			'Initial flowUpdate timestamp does not match initial distribution timestamp'
		)
	}

	let swaps = []
	let lastFlowRate = new BigNumber(flowUpdates[0].flowRate)
	// position 0 is fine, as the first iteration is skipped.
	let lastDistributionTimestamp = distributions[0].timestamp
	distributions.forEach((dist, idx) => {
		if (idx == 0) return

		const flowUpdateIdx = flowUpdates.findIndex(
			f => f.timestamp == dist.timestamp
		)

		const unitsOwned = adjustForUnits(lastFlowRate)
		const distributionAmount = new BigNumber(dist.newIndexValue).minus(
			new BigNumber(dist.oldIndexValue)
		)
		// subtracting timestamps will never overflow, so this is safe.
		const tokenAIn = lastFlowRate.multipliedBy(
			dist.timestamp - lastDistributionTimestamp
		)
		const tokenBOut = distributionAmount.multipliedBy(unitsOwned)

		// get fiat conversions
		// assumption is the market either streams to or from a stable
		// tokenB should be adjusted for 2% fee
		let tokenAFiat, tokenBFiat
		if (toStable) {
			tokenAFiat = tokenBOut.dividedBy(tokenAIn).toFixed(18)
			tokenBFiat = adjustForDecimal(tokenBOut).multipliedBy(1.02)
		} else {
			tokenAFiat = adjustForDecimal(tokenAIn)
			tokenBFiat = tokenAIn
				.dividedBy(tokenBOut)
				.multipliedBy(1.02)
				.toFixed(18)
		}

		if (
			flowHasClosed(
				flowUpdates,
				lastDistributionTimestamp,
				dist.timestamp
			)
		) {
			// if the flow has closed since the last distribution,
			// the user will NOT receive any tokens.
			swaps.push({
				tokenAIn: adjustForDecimal(tokenAIn),
				tokenBOut: bigZero.toString(),
				tokenAFiat,
				tokenBFiat: bigZero.toString()
			})
			lastFlowRate = bigZero
		} else {
			swaps.push({
				tokenAIn: adjustForDecimal(tokenAIn),
				tokenBOut: adjustForDecimal(tokenBOut),
				tokenAFiat,
				tokenBFiat
			})

			// only update flowRate if it changed. flowRate changes trigger
			// distributions, so EVERY flowUpdate lines up with a distribution.
			if (flowUpdateIdx !== -1) {
				lastFlowRate = new BigNumber(
					flowUpdates[flowUpdateIdx].flowRate
				)
			}
		}
		lastDistributionTimestamp = dist.timestamp
	})
	return swaps
}

// ----- ----- -----
// ENTRY FUNCTION
// ----- ----- -----

async function getRicochetSwapData(walletAddress) {
	// iterate ricochet markets
	let ricochetSwaps = []
	for await (const contract of contracts) {
		console.log('querying:', contract.market)
		try {
			const flowUpdates = await getFlowUpdates(
				walletAddress,
				contract.address
			)
			// if no flowUpdateEvents for a ricochet market, skip other steps
			if (flowUpdates.length === 0) continue
			const startTime = flowUpdates[0].timestamp
			const distributions = await getDistributions(
				contract.address,
				startTime
			)
			const toStable = streamsToStableCoin(contract)
			const swaps = computeSwaps(flowUpdates, distributions, toStable)
			ricochetSwaps.push({
				contract,
				swaps
			})
		} catch (error) {
			throw error
		}
	}
	return ricochetSwaps
}

exports.getRicochetSwapData = getRicochetSwapData
