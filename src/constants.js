const maticSubgraph =
	'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-matic'

const daix = {
	id: '0x1305f6b6df9dc47159d12eb7ac2804d4a33173c2',
	name: 'Super DAI (PoS)',
	symbol: 'DAIx',
	underlyingAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
}
const ric = {
	id: '0x263026e7e53dbfdce5ae55ade22493f828922965',
	name: 'Ricochet',
	symbol: 'RIC',
	underlyingAddress: '0x0000000000000000000000000000000000000000'
}
const ethx = {
	id: '0x27e1e4e6bc79d93032abef01025811b7e4727e85',
	name: 'Super WETH (PoS)',
	symbol: 'ETHx',
	underlyingAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
}
const maticx = {
	id: '0x3ad736904e9e65189c3000c7dd2c8ac8bb7cd4e3',
	name: 'Super MATIC',
	symbol: 'MATICx',
	underlyingAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
}
const wbtcx = {
	id: '0x4086ebf75233e8492f1bcda41c7f2a8288c2fb92',
	name: 'Super WBTC (PoS)',
	symbol: 'WBTCx',
	underlyingAddress: '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
}
const usdcx = {
	id: '0xcaa7349cea390f89641fe306d93591f87595dc1f',
	name: 'Super USDC (PoS)',
	symbol: 'USDCx',
	underlyingAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
}
const mkrx = {
	id: '0x2c530af1f088b836fa0dca23c7ea50e669508c4c',
	name: 'Super MAKER (PoS)',
	symbol: 'MKRx',
	underlyingAddress: '0x6f7c932e7684666c9fd1d44527765433e01ff61d'
}

const contracts = [
	{
		market: 'DAI>>WETH',
		address: '0x27C7D067A0C143990EC6ed2772E7136Cfcfaecd6',
		tokenA: daix,
		tokenB: ethx
	},
	{
		market: 'WETH>>DAI',
		address: '0x5786D3754443C0D3D1DdEA5bB550ccc476FdF11D',
		tokenA: ethx,
		tokenB: daix
	},
	{
		market: 'USDC>>WBTC',
		address: '0xe0A0ec8dee2f73943A6b731a2e11484916f45D44',
		tokenA: usdcx,
		tokenB: wbtcx
	},
	{
		market: 'WBTC>>USDC',
		address: '0x71f649EB05AA48cF8d92328D1C486B7d9fDbfF6b',
		tokenA: wbtcx,
		tokenB: usdcx
	},
	{
		market: 'USDC>>WETH',
		address: '0x8082Ab2f4E220dAd92689F3682F3e7a42b206B42',
		tokenA: usdcx,
		tokenB: ethx
	},
	{
		market: 'WETH>>USDC',
		address: '0x3941e2E89f7047E0AC7B9CcE18fBe90927a32100',
		tokenA: ethx,
		tokenB: usdcx
	},
	{
		market: 'USDC>>MATIC',
		address: '0xE093D8A4269CE5C91cD9389A0646bAdAB2c8D9A3',
		tokenA: usdcx,
		tokenB: maticx
	},
	{
		market: 'MATIC>>USDC',
		address: '0x93D2d0812C9856141B080e9Ef6E97c7A7b342d7F',
		tokenA: maticx,
		tokenB: usdcx
	},
	{
		market: 'DAI>>MATIC',
		address: '0xA152715dF800dB5926598917A6eF3702308bcB7e',
		tokenA: daix,
		tokenB: maticx
	},
	{
		market: 'MATIC>>DAI',
		address: '0x250efbB94De68dD165bD6c98e804E08153Eb91c6',
		tokenA: maticx,
		tokenB: daix
	},
	{
		market: 'USDC>>MKR',
		address: '0xC89583Fa7B84d81FE54c1339ce3fEb10De8B4C96',
		tokenA: usdcx,
		tokenB: mkrx
	},
	{
		market: 'MKR>>USDC',
		address: '0xdc19ed26aD3a544e729B72B50b518a231cBAD9Ab',
		tokenA: mkrx,
		tokenB: usdcx
	},
	{
		market: 'DAI>>MKR',
		address: '0x47de4Fd666373Ca4A793e2E0e7F995Ea7D3c9A29',
		tokenA: daix,
		tokenB: mkrx
	},
	{
		market: 'MKR>>DAI',
		address: '0x94e5b18309066dd1E5aE97628afC9d4d7EB58161',
		tokenA: mkrx,
		tokenB: daix
	},
	{
		market: 'USDC>>RIC',
		address: '0x98d463A3F29F259E67176482eB15107F364c7E18',
		tokenA: usdcx,
		tokenB: ric
	}
]

exports.contracts = contracts
exports.maticSubgraph = maticSubgraph
