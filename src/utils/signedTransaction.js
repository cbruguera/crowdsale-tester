import Eth from 'ethjs-query'
import HttpProvider from 'ethjs-provider-http'
import signer from 'ethjs-signer'
import BigNumber from 'bignumber.js'

import encodeFunction from './encodeFunction'

import { PRIVATE_KEY, ETH_PROVIDER_URL, GAS, GAS_PRICE } from '../constants'

const { sign } = signer
const eth = new Eth(new HttpProvider(ETH_PROVIDER_URL))

const signedTransaction = (abi, contractAddress, owner) => async (
  fnName,
  ...params
) => {
  const nonce = await eth.getTransactionCount(owner)
  const data = encodeFunction(abi, fnName, params)
  const wrapper = {
    to: contractAddress,
    gas: new BigNumber(GAS),
    gasPrice: new BigNumber(GAS_PRICE),
    data,
    nonce
  }
  return eth.sendRawTransaction(sign(wrapper, PRIVATE_KEY))
}

export default signedTransaction
