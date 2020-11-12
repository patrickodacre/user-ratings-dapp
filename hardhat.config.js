require("@nomiclabs/hardhat-waffle")
require('hardhat-deploy')
const env = require('./.env.js')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

task("build", "Builds a specified network and exports the files to the webapp directory")
    .addParam("exportPath", "The export path to webapp", "./webapp/src/deployed-contracts/contracts.json")
    .setAction(async ({buildNetwork, exportPath}, hre) => {
        await hre.run("deploy")
        console.log('deployed to ' + buildNetwork)

        await hre.run("export", {exportAll: exportPath})
        console.log('exported to ', exportPath)
    })

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
    namedAccounts: {
        deployer: {
            // here this will by default take the first account as deployer
            default: 0,

            // similarly on mainnet it will take the first account as deployer.
            // Note though that depending on how hardhat network are configured,
            // the account 0 on one network can be different than on another
            1: 0,

            // but for rinkeby it will be a specific address
            4: env.account_deployer,

            //it can also specify a specific netwotk name (specified in hardhat.config.js)
            "goerli": env.account_deployer,
        },
        feeCollector:{
            // here this will by default take the second account as feeCollector
            // (so in the test this will be a different account than the deployer)
            default: 1,

            // on the mainnet the feeCollector could be a multi sig
            1: env.account_fee_collector,

            // on rinkeby it could be another account
            4: env.account_fee_collector,
        }
    },
    // defaultNetwork: 'localhost',
    networks: {
        ganache: {
            url: 'http://127.0.0.1:7545',
            live: false,
            saveDeployments: true,
            tags: ["local"]
        },
        localhost: {
            url: 'http://127.0.0.1:8545',
            live: false,
            saveDeployments: true,
            tags: ["local"]
        },
        hardhat: {
            live: false,
            saveDeployments: true,
            tags: ["test", "local"]
        },
        rinkeby: {
            url: env.infura_url_rinkeby,
            accounts: {mnemonic: env.rinkeby.mnemonic},
            live: true,
            saveDeployments: true,
            tags: ["staging"]
        },
        mainnet: {
            url: env.infura_url_mainnet,
            accounts: {mnemonic: env.mainnet.mnemonic},
            live: true,
            saveDeployments: true,
            tags: ["staging"]
        }
    }
}

