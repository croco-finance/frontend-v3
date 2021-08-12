import { Account, Address, BN } from 'ethereumjs-util'
import { Transaction } from '@ethereumjs/tx'
import VM from '@ethereumjs/vm'
import { defaultAbiCoder as AbiCoder, Interface } from '@ethersproject/abi'
import { BigNumber } from 'ethers'
import { Tick } from './dailyFees'

const PRIVATE_KEY = Buffer.from('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
const ACCOUNT_ADDRESS = Address.fromPrivateKey(PRIVATE_KEY)
const CONTRACT_ADDRESS = Address.fromString('0x61de9dc6f6cff1df2809480882cfd3c2364b28f7')

async function getAccountNonce(vm: VM, accountPrivateKey: Buffer) {
  const address = Address.fromPrivateKey(accountPrivateKey)
  const account = await vm.stateManager.getAccount(address)
  return account.nonce
}

async function deployContract(vm: VM, senderPrivateKey: Buffer, deploymentBytecode: Buffer): Promise<Address> {
  // Contracts are deployed by sending their deployment bytecode to the address 0
  // The contract params should be abi-encoded and appended to the deployment bytecode.
  const txData = {
    value: 0,
    gasLimit: 2000000, // We assume that 2M is enough,
    gasPrice: 1,
    data: '0x' + deploymentBytecode.toString('hex'),
    nonce: await getAccountNonce(vm, senderPrivateKey),
  }

  const tx = Transaction.fromTxData(txData).sign(senderPrivateKey)

  const deploymentResult = await vm.runTx({ tx })

  if (deploymentResult.execResult.exceptionError) {
    throw deploymentResult.execResult.exceptionError
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return deploymentResult.createdAddress!
}

export async function getFeeGrowthInside(
  vm: VM,
  tickLower: Tick,
  tickUpper: Tick,
  tickCurrentId: number,
  feeGrowthGlobal0X128: BigNumber,
  feeGrowthGlobal1X128: BigNumber
): Promise<[BigNumber, BigNumber]> {
  const params = AbiCoder.encode(
    ['int24', 'int24', 'int24', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
    [
      tickLower.idx,
      tickUpper.idx,
      tickCurrentId,
      tickLower.feeGrowthOutside0X128,
      tickLower.feeGrowthOutside1X128,
      tickUpper.feeGrowthOutside0X128,
      tickUpper.feeGrowthOutside1X128,
      feeGrowthGlobal0X128,
      feeGrowthGlobal1X128,
    ]
  )
  const sigHash = new Interface([
    'function getFeeGrowthInside(int24,int24,int24,uint256,uint256,uint256,uint256,uint256,uint256)',
  ]).getSighash('getFeeGrowthInside')
  const result = await vm.runCall({
    to: CONTRACT_ADDRESS,
    caller: ACCOUNT_ADDRESS,
    origin: ACCOUNT_ADDRESS, // The tx.origin is also the caller here
    data: Buffer.from(sigHash.slice(2) + params.slice(2), 'hex'),
  })

  if (result.execResult.exceptionError) {
    throw result.execResult.exceptionError
  }

  const results = AbiCoder.decode(['uint256', 'uint256'], result.execResult.returnValue)

  return [results[0], results[1]]
}

export async function getPositionFees(
  vm: VM,
  feeGrowthInside: BigNumber,
  feeGrowthInsideLast: BigNumber,
  liquidity: BigNumber
): Promise<BigNumber> {
  const params = AbiCoder.encode(['uint256', 'uint256', 'uint256'], [feeGrowthInside, feeGrowthInsideLast, liquidity])
  const sigHash = new Interface(['function getPositionFees(uint256,uint256,uint256)']).getSighash('getPositionFees')
  const result = await vm.runCall({
    to: CONTRACT_ADDRESS,
    caller: ACCOUNT_ADDRESS,
    origin: ACCOUNT_ADDRESS, // The tx.origin is also the caller here
    data: Buffer.from(sigHash.slice(2) + params.slice(2), 'hex'),
  })

  if (result.execResult.exceptionError) {
    throw result.execResult.exceptionError
  }

  const results = AbiCoder.decode(['uint128'], result.execResult.returnValue)

  return results[0]
}

export async function deployContractAndGetVm(): Promise<VM> {
  const account = Account.fromAccountData({
    nonce: 0,
    balance: new BN(10).pow(new BN(18)), // 1 eth
  })
  // console.log('Set account a balance of 1 ETH')

  const vm = new VM()
  await vm.stateManager.putAccount(ACCOUNT_ADDRESS, account)

  // Bytecode obtained from https://github.com/croco-finance/uni-v3-fees-contract
  const bytecode = Buffer.from(
    '608060405234801561001057600080fd5b50610265806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806331d12d371461003b5780635991b2bc146100ac575b600080fd5b610093600480360361012081101561005257600080fd5b508035600290810b916020810135820b916040820135900b9060608101359060808101359060a08101359060c08101359060e08101359061010001356100fa565b6040805192835260208301919091528051918290030190f35b6100d5600480360360608110156100c257600080fd5b5080359060208101359060400135610163565b604080516fffffffffffffffffffffffffffffffff9092168252519081900360200190f35b6000806000808c60020b8b60020b12610117575088905087610120565b50508784038784035b6000808d60020b8d60020b121561013b575088905087610144565b50508786038786035b92909603959095039c9490930392909203995091975050505050505050565b600061017683850383600160801b610180565b90505b9392505050565b60008080600019858709868602925082811090839003039050806101b657600084116101ab57600080fd5b508290049050610179565b8084116101c257600080fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a0290910302918190038190046001018684119095039490940291909403929092049190911791909102915050939250505056fea26469706673582212204b91a1a0225dac71e1a66b3b702a459b6a8688d8203d09cb832207f0952a683964736f6c63430007060033',
    'hex'
  )

  // console.log('Deploying the contract...')
  // const contractAddress = await deployContract(vm, PRIVATE_KEY, bytecode)
  await deployContract(vm, PRIVATE_KEY, bytecode)
  // console.log('Contract address:', contractAddress.toString())

  return vm
}
