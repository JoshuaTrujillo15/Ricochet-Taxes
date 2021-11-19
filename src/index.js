// .env config first
const dotenv = require('dotenv')
dotenv.config()
const fs = require('fs')
const { getRicochetSwapData } = require('./queries')

const ADDRESS = process.env.ADDRESS

async function main() {
	const ricochetSwapData = await getRicochetSwapData(ADDRESS)
	console.log({ ricochetSwapData })
	fs.writeFile(
		'./swapData.json',
		JSON.stringify(ricochetSwapData, null, 4),
		error => {
			if (error) throw error
			console.log('File Written Successfully.')
		}
	)
}

main()
	.then(() => console.log('Exiting'))
	.catch(e => console.error(e))
