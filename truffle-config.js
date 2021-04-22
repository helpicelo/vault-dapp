// LOAD ENV VAR
require('dotenv').config();

// INIT PROVIDER USING CONTRACT KIT
const Kit = require('@celo/contractkit')
const kit = Kit.newKit(process.env.DATAHUB_NODE_URL)

// AWAIT WRAPPER FOR ASYNC FUNC
async function awaitWrapper() {
    let account = kit.connection.addAccount(process.env.PRIVATE_KEY)
}

awaitWrapper()

// TRUFFLE CONFIG OBJECT
module.exports = {
    networks: {
        alfajores: {
            provider: kit.connection.web3.currentProvider, // CeloProvider
            network_id: 44787 // latest Alfajores network id
        },
    },
    // Configure your compilers
    compilers: {
        solc: {
            version: "0.8.3", // Fetch exact version from solc-bin (default: truffle's version)
        }
    },
    db: {
        enabled: false
    }
};