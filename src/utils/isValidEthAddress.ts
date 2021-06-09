import { ethers } from 'ethers'

const isValidEthAddress = (address: string) => {
  try {
    const addressTmp = ethers.utils.getAddress(address.toLowerCase())
  } catch (e) {
    return false
  }
  return true
}

export default isValidEthAddress
