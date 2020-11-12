import ethers from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider';
import contracts from '../deployed-contracts/contracts.json'

export default () => {
    return {
        connect,
    }

    async function connect() {

        const api = {
            onAccountChanged: async (account) => {
                console.error("set api.onAccountDisconnected function")
            },
            onAccountDisconnected: async () => {
                console.error("set api.onAccountDisconnected function")
            }
        }

        const provider = await detectEthereumProvider()

        if (! provider) {
            console.log('Please install metamask')
            return [null, false]
        }

        provider.on('accountsChanged', async function ([account]) {
            if (! account) {
                return api.onAccountDisconnected()
            }

            return api.onAccountChanged(account)
        })

        api.ethers = new ethers.providers.Web3Provider(provider)
        api.provider = provider

        // load contract for this particular network.
        // the network is set when we npm start or run our build
        for (const chainID in contracts) {

            const hosts = contracts[chainID]

            for (const host in hosts) {

                if (process.env.REACT_APP_NETWORK == host) {

                    for (const contract in hosts[host].contracts) {
                        const c = hosts[host].contracts[contract]
                        api[contract] = new ethers.Contract(c.address, c.abi, api.ethers)
                    }
                }
            }
        }

        return [api, true]

    }
}

