// THIS IS NOT PART OF THE INDEX ENTRY POINT, BUT MORE OF A SANITY CHECK
// .env config first
const dotenv = require('dotenv')
dotenv.config()
const BigNumber = require('bignumber.js')

const ADDRESS = process.env.ADDRESS

const data = require(`../swapData/${ADDRESS}.json`)

function adjustForDecimal(value) {
	return value.dividedBy(new BigNumber('1000000000000000000')).toFixed(18)
}

function main() {
	for (const market of data) {
		let sumA = new BigNumber(0)
		let sumB = new BigNumber(0)
		for (const swap of market.swaps) {
			console.log({ tokenA: swap.tokenAIn, tokenB: swap.tokenBOut })
			sumA = sumA.plus(new BigNumber(swap.tokenAIn))
			sumB = sumB.plus(new BigNumber(swap.tokenBOut))
		}

		console.log('----- ----- -----')
		console.log('market:\t', market.contract.market)
		console.log('tokenASent:\t', sumA.toString())
		console.log('tokenBReceived:\t', sumB.toString())
		console.log('----- ----- -----')
	}
}

main()
