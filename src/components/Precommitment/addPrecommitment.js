import contractAccess from '../../utils/contractAccess'
import makeAction from '../../utils/actionMaker'
import BigNumber from 'bignumber.js'

import {
  PRECOMMITMENT_ADD,
  PRECOMMITMENT_ADD_FAIL,
  PRECOMMITMENT_ADD_SUCCESS
} from './actions'

import { CROWDSALE_ADDRESS, ERRORS } from '../../constants'
const {
  invalidAddress,
  notCrowdsaleOwner,
  amountMustBeGreaterThanZero
} = ERRORS

const addPrecommitment = (
  beneficiary,
  rawTokensAllocated,
  halfVesting = false,
  abi
) => async (dispatch, getState) => {
  const { owner: { isOwner, address } } = getState()
  const tokensAllocated = BigNumber(rawTokensAllocated)

  if (!isOwner) {
    dispatch(makeAction(PRECOMMITMENT_ADD_FAIL, notCrowdsaleOwner))
  } else if (!beneficiary || beneficiary === '') {
    dispatch(makeAction(PRECOMMITMENT_ADD_FAIL, invalidAddress))
  } else if (tokensAllocated.lt(0)) {
    dispatch(makeAction(PRECOMMITMENT_ADD_FAIL, amountMustBeGreaterThanZero))
  } else {
    dispatch(
      makeAction(PRECOMMITMENT_ADD, {
        beneficiary,
        tokensAllocated,
        halfVesting
      })
    )
    try {
      const crowdsale = contractAccess(CROWDSALE_ADDRESS, abi)
      await crowdsale.addPrecommitment(
        beneficiary,
        tokensAllocated,
        halfVesting,
        { from: address }
      )
      dispatch(makeAction(PRECOMMITMENT_ADD_SUCCESS))
    } catch (err) {
      dispatch(makeAction(PRECOMMITMENT_ADD_FAIL, err.message))
    }
  }
}

export default addPrecommitment
