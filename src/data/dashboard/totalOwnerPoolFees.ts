import { gql } from '@apollo/client/core'
import { clientCroco as client } from 'apollo/client'
import { BigNumber } from 'ethers'
import { getFeeGrowthInside, getPositionFees, deployContractAndGetVm } from './contractUtils'

export interface TokenFees {
  amount0: BigNumber
  amount1: BigNumber
}

export interface Tick {
  idx: number
  feeGrowthOutside0X128: BigNumber
  feeGrowthOutside1X128: BigNumber
}

const POSITIONS_QUERY = gql`
  query positions($owner: String, $pool: String) {
    positions(where: { owner: $owner, pool: $pool }) {
      pool {
        tick
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
      }
      tickLower {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      tickUpper {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      liquidity
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`

export function parseTick(tick: any): Tick {
  return {
    idx: Number(tick.tickIdx),
    feeGrowthOutside0X128: BigNumber.from(tick.feeGrowthOutside0X128),
    feeGrowthOutside1X128: BigNumber.from(tick.feeGrowthOutside1X128),
  }
}

export async function getTotalOwnerPoolFees(owner: string, pool: string): Promise<TokenFees> {
  const result = await client.query({
    query: POSITIONS_QUERY,
    variables: {
      owner,
      pool,
    },
  })

  const vm = await deployContractAndGetVm()

  const totalFees: TokenFees = {
    amount0: BigNumber.from(0),
    amount1: BigNumber.from(0),
  }

  for (const position of result.data.positions) {
    const [feeGrowthInside0X128, feeGrowthInside1X128] = await getFeeGrowthInside(
      vm,
      parseTick(position.tickLower),
      parseTick(position.tickUpper),
      Number(position.pool.tick),
      BigNumber.from(position.pool.feeGrowthGlobal0X128),
      BigNumber.from(position.pool.feeGrowthGlobal1X128)
    )

    const liquidity = BigNumber.from(position.liquidity)
    const fees0Promise = getPositionFees(
      vm,
      feeGrowthInside0X128,
      BigNumber.from(position.feeGrowthInside0LastX128),
      liquidity
    )
    const fees1Promise = getPositionFees(
      vm,
      feeGrowthInside1X128,
      BigNumber.from(position.feeGrowthInside1LastX128),
      liquidity
    )

    totalFees.amount0 = totalFees.amount0.add(await fees0Promise)
    totalFees.amount1 = totalFees.amount1.add(await fees1Promise)
  }
  return totalFees
}

// (async function main() {
//     const totalFees = await getTotalOwnerPoolFees(
//         '0x95ae3008c4ed8c2804051dd00f7a27dad5724ed1',
//         '0x151ccb92bc1ed5c6d0f9adb5cec4763ceb66ac7f',
//     );
//     console.log(totalFees.amount0.toString());
//     console.log(totalFees.amount1.toString());
// })().catch(error => console.error(error));
