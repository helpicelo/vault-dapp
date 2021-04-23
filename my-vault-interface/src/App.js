import React, { useState } from 'react';
import { newKit } from '@celo/contractkit'
import dotenv from 'dotenv'
import Vault from './contract/Vault.json'

// LOAD ENV VAR
dotenv.config()

const kit = newKit(process.env.REACT_APP_DATAHUB_NODE_URL)
const connectAccount = kit.addAccount(process.env.REACT_APP_PRIVATE_KEY)
// CONTRACT INSTANCE
const VaultO = new kit.web3.eth.Contract(Vault.abi, process.env.REACT_APP_VAULT_ADDRESS)

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
  const amount = kit.web3.utils.toWei("0.3", 'ether')
  // ERC20 TO LOCK
  const goldtoken = await kit._web3Contracts.getGoldToken()
  
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

const withdraw = async () => {
  const txo = await VaultO.methods.withdrawTokens("12")
  const tx = await kit.sendTransactionObject(txo, {from: process.env.REACT_APP_ADDRESS})
  const receipt = tx.waitReceipt()
  console.log(receipt)
}

function App() {

  const [CELOBal, setCELOBal] = useState(0);
  const [cUSDBal, setcUSDBal] = useState(0);
  const [vaultBal, setVaultBal] = useState(0)
  const [vaultBalAddress, setVaultBalAddress] = useState(0)

  const getBalanceHandle = async () => { 
    const totalLockedBalance = await VaultO.methods.getTokenTotalLockedBalance(process.env.REACT_APP_CELO_TOKEN_ADDRESS).call()
    const totalBalance = await kit.getTotalBalance(process.env.REACT_APP_ADDRESS)

    const {CELO, cUSD} = totalBalance
    setCELOBal(kit.web3.utils.fromWei(CELO.toString()))
    setcUSDBal(kit.web3.utils.fromWei(cUSD.toString()))
    setVaultBal(kit.web3.utils.fromWei(totalLockedBalance.toString()))
  } 

  return (
    <div>
      <h1>ACTIONS</h1>
      <button onClick={approve}>APPROVE</button>
      <button onClick={lock}>LOCK</button>
      <button onClick={withdraw}>WITHDRAW</button>
      <button onClick={getBalanceHandle}>GET BALANCE</button>
      <h1>DATA WALLET</h1>
      <ul>
        <li>
          CELO BALANCE: {CELOBal}
        </li>
        <li>
          cUSD BALANCE: {cUSDBal}
        </li>
      </ul>
      <h1>DATA VAULT SMART CONTRACT</h1>
      <ul>
        <li>
          TOTAL CELO BALANCE: {vaultBal}
        </li>
      </ul>
    </div>
  );
}

export default App;
