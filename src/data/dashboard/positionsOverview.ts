import { client } from 'apollo/client'
import gql from 'graphql-tag'
import { Token } from '@uniswap/sdk-core'
import { Pool, Position } from '@uniswap/v3-sdk'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

// See https://docs.uniswap.org/reference/core/libraries/FixedPoint128 for details
const Q128 = BigNumber.from('0x100000000000000000000000000000000')

export interface TokenFees {
  amount0: BigNumber
  amount1: BigNumber
}

export interface Tick {
  idx: number
  feeGrowthOutside0X128: BigNumber
  feeGrowthOutside1X128: BigNumber
}

export function parseTick(tick: any): Tick {
  return {
    idx: Number(tick.tickIdx),
    feeGrowthOutside0X128: BigNumber.from(tick.feeGrowthOutside0X128),
    feeGrowthOutside1X128: BigNumber.from(tick.feeGrowthOutside1X128),
  }
}

// reimplementation of Tick.getFeeGrowthInside
export function getFeeGrowthInside(
  tickLower: Tick,
  tickUpper: Tick,
  tickCurrentId: number,
  feeGrowthGlobal0X128: BigNumber,
  feeGrowthGlobal1X128: BigNumber
): [BigNumber, BigNumber] {
  // calculate fee growth below
  let feeGrowthBelow0X128: BigNumber
  let feeGrowthBelow1X128: BigNumber
  if (tickCurrentId >= tickLower.idx) {
    feeGrowthBelow0X128 = tickLower.feeGrowthOutside0X128
    feeGrowthBelow1X128 = tickLower.feeGrowthOutside1X128
  } else {
    feeGrowthBelow0X128 = feeGrowthGlobal0X128.sub(tickLower.feeGrowthOutside0X128)
    feeGrowthBelow1X128 = feeGrowthGlobal1X128.sub(tickLower.feeGrowthOutside1X128)
  }

  // calculate fee growth above
  let feeGrowthAbove0X128: BigNumber
  let feeGrowthAbove1X128: BigNumber
  if (tickCurrentId < tickUpper.idx) {
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
    amount0: feeGrowthInside0X128.sub(feeGrowthInside0LastX128).mul(liquidity).div(Q128),
    amount1: feeGrowthInside1X128.sub(feeGrowthInside1LastX128).mul(liquidity).div(Q128),
  }
}

export class PositionInOverview extends Position {
  readonly tokenId: number // token ID (e.g. 34054)
  readonly owner: string // user address
  readonly poolAddress: string // address of the pool this position belongs to

  readonly token0priceUSD: number
  readonly token1priceUSD: number
  readonly liquidityUSD: number

  // Sum of all uncollected fees
  readonly uncollectedFeesToken0: number
  readonly uncollectedFeesToken1: number
  readonly uncollectedFeesUSD: number

  constructor(positionData: any, ethPrice: number) {
    const poolData = positionData.pool
    super({
      pool: new Pool(
        new Token(
          1,
          poolData.token0.id,
          parseInt(poolData.token0.decimals),
          poolData.token0.symbol,
          poolData.token0.name
        ),
        new Token(
          1,
          poolData.token1.id,
          parseInt(poolData.token1.decimals),
          poolData.token1.symbol,
          poolData.token1.name
        ),
        parseInt(poolData.feeTier),
        parseInt(poolData.sqrtPrice),
        parseInt(poolData.liquidity),
        parseInt(poolData.tick)
      ),
      liquidity: positionData.liquidity,
      tickLower: Number(positionData.tickLower.tickIdx),
      tickUpper: Number(positionData.tickUpper.tickIdx),
    })
    this.tokenId = Number(positionData.id)
    this.owner = positionData.owner
    this.poolAddress = poolData.id

    this.token0priceUSD = ethPrice * Number(poolData.token0.derivedETH)
    this.token1priceUSD = ethPrice * Number(poolData.token1.derivedETH)
    this.liquidityUSD =
      Number(this.amount0.toSignificant()) * this.token0priceUSD +
      Number(this.amount1.toSignificant()) * this.token1priceUSD

    const tickLower = parseTick(positionData.tickLower)
    const tickUpper = parseTick(positionData.tickUpper)

    const [feeGrowthInside0X128, feeGrowthInside1X128] = getFeeGrowthInside(
      tickLower,
      tickUpper,
      this.pool.tickCurrent,
      BigNumber.from(poolData.feeGrowthGlobal0X128),
      BigNumber.from(poolData.feeGrowthGlobal1X128)
    )
    const fees = getTotalPositionFees(
      feeGrowthInside0X128,
      feeGrowthInside1X128,
      BigNumber.from(positionData.feeGrowthInside0LastX128),
      BigNumber.from(positionData.feeGrowthInside1LastX128),
      BigNumber.from(positionData.liquidity)
    )
    this.uncollectedFeesToken0 = Number(formatUnits(fees.amount0, this.pool.token0.decimals))
    this.uncollectedFeesToken1 = Number(formatUnits(fees.amount1, this.pool.token1.decimals))
    this.uncollectedFeesUSD =
      this.uncollectedFeesToken0 * this.token0priceUSD + this.uncollectedFeesToken1 * this.token1priceUSD
  }
}

const POSITIONS_QUERY = gql`
  query positions($owners: [String]) {
    bundle(id: "1") {
      ethPriceUSD
    }
    positions(where: { owner_in: $owners }) {
      id
      owner
      pool {
        id
        token0 {
          id
          symbol
          name
          decimals
          derivedETH
        }
        token1 {
          id
          symbol
          name
          decimals
          derivedETH
        }
        liquidity
        sqrtPrice
        tick
        feeTier
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
      collectedFeesToken0
      collectedFeesToken1
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`

/**
 * Returns data about all positions for given owner addresses
 * @param owners an array of owner addresses
 */
export async function getPositions(owners: string[]) {
  const positions: { [key: string]: PositionInOverview[] } = {}

  let error = false

  try {
    const result = await client.query({
      query: POSITIONS_QUERY,
      variables: {
        owners,
      },
    })
    const ethPrice = Number(result.data.bundle.ethPriceUSD)

    for (const positionData of result.data.positions) {
      if (!positions[positionData.owner]) positions[positionData.owner] = []
      positions[positionData.owner].push(new PositionInOverview(positionData, ethPrice))
    }
  } catch {
    error = true
  }

  return { data: positions, error }
}
