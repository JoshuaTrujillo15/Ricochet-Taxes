function jsonToCsv(swapData) {
	let csvData =
		'market,market_address,token_a,token_b,token_a_amount_in,token_b_amount_out,token_a_fiat_amount_in,token_b_fiat_amount_out\n'
	for (const data of swapData) {
		const { contract, swaps } = data
		const metadata = `${contract.market},${contract.address},${contract.tokenA.id},${contract.tokenB.id},`
		for (const swap of swaps) {
			const amounts = `${swap.tokenAIn},${swap.tokenBOut},${swap.tokenAFiat},${swap.tokenAFiat}\n`
			const line = metadata.concat(amounts)
			csvData = csvData.concat(line)
		}
	}
	return csvData
}

exports.jsonToCsv = jsonToCsv
