// import gql from 'graphql-tag'
import { gql } from '@apollo/client/core'
import { client } from 'apollo/client'
import { BigNumber } from 'ethers'

// See https://docs.uniswap.org/reference/core/libraries/FixedPoint128 for details
const Q128 = BigNumber.from('0x100000000000000000000000000000000')

export interface TokenFees {
  feesToken0: BigNumber
  feesToken1: BigNumber
}

export interface Tick {
  id: BigNumber
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
        id: tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      tickUpper {
        id: tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      liquidity
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`

function parseTick(tick: any): Tick {
  return {
    id: BigNumber.from(tick.id),
    feeGrowthOutside0X128: BigNumber.from(tick.feeGrowthOutside0X128),
    feeGrowthOutside1X128: BigNumber.from(tick.feeGrowthOutside1X128),
  }
}

// reimplementation of Tick.getFeeGrowthInside
export function getFeeGrowthInside(
  tickLower: Tick,
  tickUpper: Tick,
  tickCurrentId: BigNumber,
  feeGrowthGlobal0X128: BigNumber,
  feeGrowthGlobal1X128: BigNumber
): [BigNumber, BigNumber] {
  // calculate fee growth below
  let feeGrowthBelow0X128: BigNumber
  let feeGrowthBelow1X128: BigNumber
  if (tickCurrentId.gte(tickLower.id)) {
    feeGrowthBelow0X128 = tickLower.feeGrowthOutside0X128
    feeGrowthBelow1X128 = tickLower.feeGrowthOutside1X128
  } else {
    feeGrowthBelow0X128 = feeGrowthGlobal0X128.sub(tickLower.feeGrowthOutside0X128)
    feeGrowthBelow1X128 = feeGrowthGlobal1X128.sub(tickLower.feeGrowthOutside1X128)
  }

  // calculate fee growth above
  let feeGrowthAbove0X128: BigNumber
  let feeGrowthAbove1X128: BigNumber
  if (tickCurrentId.lt(tickUpper.id)) {
    feeGrowthAbove0X128 = tickUpper.feeGrowthOutside0X128
    feeGrowthAbove1X128 = tickUpper.feeGrowthOutside1X128
  } else {
    feeGrowthAbove0X128 = feeGrowthGlobal0X128.sub(tickUpper.feeGrowthOutside0X128)
    feeGrowthAbove1X128 = feeGrowthGlobal1X128.sub(tickUpper.feeGrowthOutside1X128)
  }

  const feeGrowthInside0X128 = feeGrowthGlobal0X128.sub(feeGrowthBelow0X128).sub(feeGrowthAbove0X128)
  const feeGrowthInside1X128 = feeGrowthGlobal1X128.sub(feeGrowthBelow1X128).sub(feeGrowthAbove1X128)

  return [feeGrowthInside0X128, feeGrowthInside1X128]
}

export function getTotalPositionFees(
  feeGrowthInside0X128: BigNumber,
  feeGrowthInside1X128: BigNumber,
  feeGrowthInside0LastX128: BigNumber,
  feeGrowthInside1LastX128: BigNumber,
  liquidity: BigNumber
): TokenFees {
  return {
    feesToken0: feeGrowthInside0X128.sub(feeGrowthInside0LastX128).mul(liquidity).div(Q128),
    feesToken1: feeGrowthInside1X128.sub(feeGrowthInside1LastX128).mul(liquidity).div(Q128),
  }
}

export async function getTotalUserPoolFees(user: string, pool: string): Promise<TokenFees> {
  console.log(`getTotalUserPoolFees(), user: ${user}, pool: ${pool}`)
  const result = await client.query({
    query: POSITIONS_QUERY,
    variables: {
      owner: user,
      pool: pool,
    },
  })

  console.log(`result`, result)

  const totalFees: TokenFees = {
    feesToken0: BigNumber.from(0),
    feesToken1: BigNumber.from(0),
  }

  for (const position of result.data.positions) {
    const [feeGrowthInside0X128, feeGrowthInside1X128] = getFeeGrowthInside(
      parseTick(position.tickLower),
      parseTick(position.tickUpper),
      BigNumber.from(position.pool.tick),
      BigNumber.from(position.pool.feeGrowthGlobal0X128),
      BigNumber.from(position.pool.feeGrowthGlobal1X128)
    )
    const fees = getTotalPositionFees(
      feeGrowthInside0X128,
      feeGrowthInside1X128,
      BigNumber.from(position.feeGrowthInside0LastX128),
      BigNumber.from(position.feeGrowthInside1LastX128),
      BigNumber.from(position.liquidity)
    )

    totalFees.feesToken0 = totalFees.feesToken0.add(fees.feesToken0)
    totalFees.feesToken1 = totalFees.feesToken1.add(fees.feesToken1)
  }

  return totalFees
}
