import BigNumber from 'bignumber.js'

import signedTransaction from '../../utils/signedTransaction'
import makeAction from '../../utils/actionMaker'
import { parse } from '../../utils/precommitmentCSV'
import blockchainAction from '../../utils/blockchainAction'

import {
  PRECOMMITMENTS_BULK_ADD,
  PRECOMMITMENT_SINGLE_ADD,
  PRECOMMITMENT_SINGLE_ADD_FAIL,
  PRECOMMITMENT_SINGLE_ADD_SUCCESS
} from './actions'

import { CROWDSALE_ADDRESS, ERRORS } from '../../constants'
const { invalidData, notCrowdsaleOwner } = ERRORS

const handler = async ({
  params: [data],
  dispatch,
  state: { owner: { address, isOwner }, contract: { SelfkeyCrowdsale } }
}) => {
  if (!isOwner) throw new Error(notCrowdsaleOwner)
  if (!data || data === '') throw new Error(invalidData)

  const signTx = signedTransaction(
    SelfkeyCrowdsale.abi,
    CROWDSALE_ADDRESS,
    address
  )

  return Promise.all(
    data.map(async item => {
      const { beneficiary, tokensAllocated, halfVesting } = item
      dispatch(makeAction(PRECOMMITMENT_SINGLE_ADD, item))
      try {
        const tx = await signTx(
          'addPrecommitment',
          beneficiary,
          BigNumber(tokensAllocated),
          halfVesting
        )
        console.debug('addPrecommitment tx', tx)
        dispatch(makeAction(PRECOMMITMENT_SINGLE_ADD_SUCCESS, item))
        return tx
      } catch (err) {
        dispatch(makeAction(PRECOMMITMENT_SINGLE_ADD_FAIL, err.message))
        throw err
      }
    })
  )
}

const addPrecommitments = data =>
  blockchainAction(parse(data))(PRECOMMITMENTS_BULK_ADD, handler)

export default addPrecommitments
