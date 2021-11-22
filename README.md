# RICOCHET TAXES

Script that fetches swap data for Ricochet Exchange.

## Usage

First, copy the env template and add your address to the environment variables.

```bash
cp .env.template .env
# edit the .env file
```

Second, install dependencies.

```bash
yarn install
# or `npm install`
```

Finally, run the script

```bash
yarn start
# or `npm start`
```

You should have two new files, `swapData.json` and `swapData.csv`, depending
on your needs.

To validate, run:

```bash
yarn validate
```

This should return the net delta in tokenA and tokenB balances for each market,
given the same address. _NOTE_ you must run the script first, as it validates
against the address in the .env file.
