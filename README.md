# User Ratings - Dapp

Using DApp Starter 

- Uses [Hardhat](https://hardhat.org/) for base tooling, testing, migrations, etc.

## Tests

`npx hardhat test`

## Deployments

For Deployments, you'll need to create a new file `.env.js` based on .env_sample.js and fill in the desired wallet mnemonic and account numbers that will be used to sign the deployment. These values are referenced in the hardhat.config.js file. 

`npx hardhat --network [network key in config] build`

eg:
`npx hardhat --network rinkeby build`
`npx hardhat --network localhost build`

### Working Locally

To work locally, you can use Hardhat's local node.

You can launch with the --show-accounts flag so you can grab an account and import it into MetaMask for local testing.

NOTE: If you've just deployed your contract, you should go to MetaMask -> settings -> reset account to clear the history and reset the account nonce.

`npx hardhat node --show-accounts`
