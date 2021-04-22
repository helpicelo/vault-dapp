import { newKit } from '@celo/contractkit'
import dotenv from 'dotenv'
import Vault from './contract/Vault.json'

// LOAD ENV VAR
dotenv.config()

const kit = newKit(process.env.REACT_APP_DATAHUB_NODE_URL)
const connectAccount = kit.addAccount(process.env.REACT_APP_PRIVATE_KEY)

const lock = async () => {
  // TIMESTAMP
  const lastBlock = await kit.web3.eth.getBlockNumber()
  let {timestamp} = await kit.web3.eth.getBlock(lastBlock)
  var timestampObj = new Date(timestamp * 1000)
  // TIME TO LOCK + 10 MINS
  var unlockTime = timestampObj.setMinutes(timestampObj.getMinutes() + 10) / 1000
  

  // GAS ESTIMATOR
  const gasEstimate = kit.gasEstimate
  // AMMOUNT TO LOCK
  const amount = kit.web3.utils.toWei("1", 'ether')
  // ERC20 TO LOCK
  const goldtoken = await kit._web3Contracts.getGoldToken()
  // CONTRACT INSTANCE
  const VaultO = new kit.web3.eth.Contract(Vault.abi, process.env.REACT_APP_VAULT_ADDRESS)
  // TX OBJECT AND SEND
  const txo = await VaultO.methods.lockTokens(goldtoken._address, process.env.REACT_APP_ADDRESS, amount, unlockTime)
  const tx = await kit.sendTransactionObject(txo, {from: process.env.REACT_APP_ADDRESS, gasPrice: gasEstimate})

  // PRINT TX RESULT
  const receipt = await tx.waitReceipt()
  console.log(receipt)
}

const approve = async () => {
  // MAX ALLOWANCE
  const allowance = kit.web3.utils.toWei('1000000', 'ether')
  // GAS ESTIMATOR
  const gasEstimate = kit.gasEstimate
  // ASSET TO ALLOW
  const goldtoken = await kit._web3Contracts.getGoldToken()
  // TX OBJECT AND SEND
  const approveTxo = await goldtoken.methods.approve(process.env.REACT_APP_VAULT_ADDRESS, allowance)
  const approveTx = await kit.sendTransactionObject(approveTxo, {from: process.env.REACT_APP_ADDRESS, gasPrice: gasEstimate})

  const receipt = await approveTx.waitReceipt()
  // PRINT TX RESULT
  console.log(receipt)
}

function App() {
  return (
    <div>
      <button onClick={approve}>APPROVE</button>
      <button onClick={lock}>LOCK</button>
    </div>
  );
}

export default App;
