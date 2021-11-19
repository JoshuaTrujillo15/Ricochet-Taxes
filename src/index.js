// .env config first
const dotenv = require('dotenv')
dotenv.config()
const fs = require('fs')
const { getRicochetSwapData } = require('./queries')
const { jsonToCsv } = require('./formatter')

const ADDRESS = process.env.ADDRESS

async function main() {
	const ricochetSwapData = await getRicochetSwapData(ADDRESS)
	fs.writeFile(
		'./swapData.json',
		JSON.stringify(ricochetSwapData, null, 4),
		error => {
			if (error) throw error
			console.log('JSON Written.')
		}
	)
	fs.writeFile('./swapData.csv', jsonToCsv(ricochetSwapData), error => {
		if (error) throw error
		console.log('CSV Written.')
	})
}

main()
	.then(() => {})
	.catch(e => console.error(e))
