import signedTransaction from '../../utils/signedTransaction'
import BigNumber from 'bignumber.js'
import blockchainMiningAction from '../../utils/blockchainMiningAction'

import { PRECOMMITMENT_ADD } from './actions'

import { CROWDSALE_ADDRESS, ERRORS } from '../../constants'
const {
  invalidAddress,
  notCrowdsaleOwner,
  amountMustBeGreaterThanZero
} = ERRORS

const handler = async ({
  params,
  dispatch,
  state: { owner: { address, isOwner }, contract: { SelfkeyCrowdsale } }
}) => {
  const [beneficiary, tokensAllocated] = params

  if (!isOwner) throw new Error(notCrowdsaleOwner)
  if (!beneficiary || beneficiary === '') throw new Error(invalidAddress)
  if (tokensAllocated.lte(0)) throw new Error(amountMustBeGreaterThanZero)

  const signTx = signedTransaction(
    SelfkeyCrowdsale.abi,
    CROWDSALE_ADDRESS,
    address
  )

  const tx = await signTx('addPrecommitment', ...params)
  console.debug('addPrecommitment tx', tx)
  return tx
}

const addPrecommitment = (
  beneficiary,
  rawTokensAllocated,
  halfVestingString
) => {
  const tokensAllocated = BigNumber(rawTokensAllocated || '0')
  const halfVesting = halfVestingString === 'true'

  return blockchainMiningAction(beneficiary, tokensAllocated, halfVesting)(
    PRECOMMITMENT_ADD,
    handler
  )
}

export default addPrecommitment
