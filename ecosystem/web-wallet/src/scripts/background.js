// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

import { AptosClient } from 'aptos'
import { DEVNET_NODE_URL } from '../core/constants'
import { MessageMethod } from '../core/types'
import { getAptosAccountState } from '../core/utils/account'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const account = getAptosAccountState()
  if (account === undefined) {
    sendResponse({ error: 'No Accounts' })
    return
  }

  switch (request.method) {
    case MessageMethod.CONNECT:
      connect(account, sendResponse)
      break
    case MessageMethod.DISCONNECT:
      disconnect()
      break
    case MessageMethod.IS_CONNECTED:
      isConnected(sendResponse)
      break
    case MessageMethod.GET_ACCOUNT_ADDRESS:
      getAccountAddress(account, sendResponse)
      break
    case MessageMethod.SIGN_TRANSACTION:
      signTransaction(account, request.args.transaction, sendResponse)
      break
    default:
      throw new Error(request.method + ' method is not supported')
  }
  return true
})

function connect (account, sendResponse) {
  // todo: register caller for permission checking purposes
  getAccountAddress(account, sendResponse)
}

function disconnect () {
  // todo: unregister caller
}

function isConnected (sendResponse) {
  // todo: send boolean response based on registered caller
  sendResponse(true)
}

function getAccountAddress (account, sendResponse) {
  if (account.address()) {
    sendResponse({ address: account.address().hex() })
  } else {
    sendResponse({ error: 'No accounts signed in' })
  }
}

async function signTransaction (account, transaction, sendResponse) {
  try {
    const client = new AptosClient(DEVNET_NODE_URL)
    const address = account.address()
    const txn = await client.generateTransaction(address, transaction)
    const signedTxn = await client.signTransaction(account, txn)
    const response = await client.submitTransaction(account, signedTxn)
    sendResponse(response)
  } catch (error) {
    sendResponse({ error })
  }
}
