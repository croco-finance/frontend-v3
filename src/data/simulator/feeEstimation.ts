import { gql } from '@apollo/client/core'
import { maxLiquidityForAmounts, TickMath } from '@uniswap/v3-sdk'
import { clientCroco as client } from 'apollo/client'
import { getPool, RawPoolData } from 'utils/sdkUtils'
import { parseTick } from '../dashboard/dailyFees'
import { BigNumber } from 'ethers'
import getBlockNumDaysAgo from 'utils/getBockNumDaysAgo'
import { formatUnits } from 'ethers/lib/utils'
import { getFeeGrowthInside, getPositionFees, deployContractAndGetVm } from '../dashboard/contractUtils'
import { Tick } from '../dashboard/dailyFees'

export const FEE_ESTIMATE_QUERY = gql`
  query feeEstimationData($pool: String, $tickLower: String, $tickUpper: String, $block: Int) {
    bundle(id: "1") {
      ethPriceUSD
    }
    pool(id: $pool) {
      token0 {
        id
        decimals
        derivedETH
      }
      token1 {
        id
        decimals
        derivedETH
      }
      feeTier
      liquidity
      sqrtPrice
      tick
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
    }
    tickLower: tick(id: $tickLower) {
      tickIdx
      feeGrowthOutside0X128
      feeGrowthOutside1X128
    }
    tickUpper: tick(id: $tickUpper) {
      tickIdx
      feeGrowthOutside0X128
      feeGrowthOutside1X128
    }
    poolOld: pool(id: $pool, block: { number: $block }) {
      token0 {
        id
        decimals
        derivedETH
      }
      token1 {
        id
        decimals
        derivedETH
      }
      feeTier
      liquidity
      sqrtPrice
      tick
      feeGrowthGlobal0X128
      feeGrowthGlobal1X128
    }
    tickLowerOld: tick(id: $tickLower, block: { number: $block }) {
      tickIdx
      feeGrowthOutside0X128
      feeGrowthOutside1X128
    }
    tickUpperOld: tick(id: $tickUpper, block: { number: $block }) {
      tickIdx
      feeGrowthOutside0X128
      feeGrowthOutside1X128
    }
  }
`

function getTick(tickData: any, tickIdx: number): Tick {
  if (tickData === null) {
    return {
      idx: tickIdx,
      feeGrowthOutside0X128: BigNumber.from('0'),
      feeGrowthOutside1X128: BigNumber.from('0'),
    }
  } else {
    return parseTick(tickData)
  }
}

export function getLiquidity(
  rawPoolData: RawPoolData,
  tickLower: number,
  tickUpper: number,
  liquidityUsd: number,
  token0Price: number,
  token1Price: number
): BigNumber {
  const pool = getPool(rawPoolData)

  let token0Share: number
  let token1Share: number

  if (pool.tickCurrent <= tickLower) {
    token0Share = 1
    token1Share = 0
  } else if (tickLower < pool.tickCurrent && pool.tickCurrent < tickUpper) {
    token0Share = (tickUpper - pool.tickCurrent) / (tickUpper - tickLower)
    token1Share = (pool.tickCurrent - tickLower) / (tickUpper - tickLower)
  } else {
    token0Share = 0
    token1Share = 1
  }

  const token0Amount = (liquidityUsd / token0Price) * token0Share * 10 ** pool.token0.decimals
  const token1Amount = (liquidityUsd / token1Price) * token1Share * 10 ** pool.token1.decimals

  const liquidityJSBI = maxLiquidityForAmounts(
    pool.sqrtRatioX96,
    TickMath.getSqrtRatioAtTick(tickLower),
    TickMath.getSqrtRatioAtTick(tickUpper),
    Math.round(token0Amount),
    Math.round(token1Amount)
  )
  return BigNumber.from(liquidityJSBI.toString())
}

export async function estimate24hUsdFees(
  pool: string,
  liquidityUsd: number,
  tickLower: number,
  tickUpper: number,
  numDaysAgo: number
): Promise<number> {
  const vm = await deployContractAndGetVm()
  // 1. fetch block from numDaysAgo
  const blockNumDaysAgo = await getBlockNumDaysAgo(numDaysAgo)

  // 2. fetch all the other data
  const result = await client.query({
    query: FEE_ESTIMATE_QUERY,
    variables: {
      pool,
      tickLower: pool + '#' + tickLower,
      tickUpper: pool + '#' + tickUpper,
      block: blockNumDaysAgo,
    },
  })

  // 3. parse and verify data
  const poolDataCurrent = result.data.pool
  const tickLowerInstanceCurrent = getTick(result.data.tickLower, tickLower)
  const tickUpperInstanceCurrent = getTick(result.data.tickUpper, tickUpper)

  if (tickLowerInstanceCurrent.idx >= tickUpperInstanceCurrent.idx) {
    console.error('Lower tick Idx >= Upper tick Idx')
    return 0
  }

  const poolDataOld = result.data.poolOld
  const tickLowerInstanceOld = getTick(result.data.tickLowerOld, tickLower)
  const tickUpperInstanceOld = getTick(result.data.tickUpperOld, tickUpper)

  if (tickLowerInstanceOld.idx >= tickUpperInstanceOld.idx) {
    console.error('Old lower tick Idx >= Old upper tick Idx')
    return 0
  }

  // 4. get fee growth between given ticks at present moment
  const [feeGrowthInside0X128, feeGrowthInside1X128] = await getFeeGrowthInside(
    vm,
    tickLowerInstanceCurrent,
    tickUpperInstanceCurrent,
    Number(poolDataCurrent.tick),
    BigNumber.from(poolDataCurrent.feeGrowthGlobal0X128),
    BigNumber.from(poolDataCurrent.feeGrowthGlobal1X128)
  )

  // 5. get fee growth at the beginning of the estimation period
  const [feeGrowthInside0LastX128, feeGrowthInside1LastX128] = await getFeeGrowthInside(
    vm,
    tickLowerInstanceOld,
    tickUpperInstanceOld,
    Number(poolDataOld.tick),
    BigNumber.from(poolDataOld.feeGrowthGlobal0X128),
    BigNumber.from(poolDataOld.feeGrowthGlobal1X128)
  )

  // 6. convert liquidityUsd to liquidity
  const ethPrice = Number(result.data.bundle.ethPriceUSD)
  const token0Price = ethPrice * Number(poolDataCurrent.token0.derivedETH)
  const token1Price = ethPrice * Number(poolDataCurrent.token1.derivedETH)

  const liquidity = getLiquidity(result.data.pool, tickLower, tickUpper, liquidityUsd, token0Price, token1Price)

  // 7. compute fees
  const fees0Promise = getPositionFees(vm, feeGrowthInside0X128, feeGrowthInside0LastX128, liquidity)
  const fees1Promise = getPositionFees(vm, feeGrowthInside1X128, feeGrowthInside1LastX128, liquidity)

  const feesToken0 = Number(formatUnits(await fees0Promise, poolDataCurrent.token0.decimals))
  const feesToken1 = Number(formatUnits(await fees1Promise, poolDataCurrent.token1.decimals))

  return (feesToken0 * token0Price + feesToken1 * token1Price) / numDaysAgo
}
