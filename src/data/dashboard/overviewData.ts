import { useQuery } from '@apollo/client'
import { Token } from '@uniswap/sdk-core'
import { Pool, Position } from '@uniswap/v3-sdk'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import gql from 'graphql-tag'
import { useEffect, useState } from 'react'
import { PositionData } from 'state/dashboard/reducer'
import { getFeeGrowthInside, getPositionFees } from './contractUtils'
import { parseTick } from './dailyFees'

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
  readonly ethPriceUSD: number

  // Sum of all uncollected fees
  uncollectedFeesToken0: number | undefined
  uncollectedFeesToken1: number | undefined
  uncollectedFeesUSD: number | undefined

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
        poolData.sqrtPrice,
        poolData.liquidity,
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
    this.ethPriceUSD = ethPrice
  }

  public async setFees(positionData: any, vm: any) {
    const poolData = positionData.pool
    const tickLower = parseTick(positionData.tickLower)
    const tickUpper = parseTick(positionData.tickUpper)

    const [feeGrowthInside0X128, feeGrowthInside1X128] = await getFeeGrowthInside(
      vm,
      tickLower,
      tickUpper,
      this.pool.tickCurrent,
      BigNumber.from(poolData.feeGrowthGlobal0X128),
      BigNumber.from(poolData.feeGrowthGlobal1X128)
    )

    const liquidity = BigNumber.from(positionData.liquidity)
    const fees0Promise = getPositionFees(
      vm,
      feeGrowthInside0X128,
      BigNumber.from(positionData.feeGrowthInside0LastX128),
      liquidity
    )
    const fees1Promise = getPositionFees(
      vm,
      feeGrowthInside1X128,
      BigNumber.from(positionData.feeGrowthInside1LastX128),
      liquidity
    )

    this.uncollectedFeesToken0 = Number(formatUnits(await fees0Promise, this.pool.token0.decimals))
    this.uncollectedFeesToken1 = Number(formatUnits(await fees1Promise, this.pool.token1.decimals))
    this.uncollectedFeesUSD =
      this.uncollectedFeesToken0 * this.token0priceUSD + this.uncollectedFeesToken1 * this.token1priceUSD
  }
}

export const POSITIONS_BULK = (owners: string[]) => {
  let ownersString = `[`
  owners.map((owner) => {
    return (ownersString += `"${owner}",`)
  })
  ownersString += ']'
  const queryString = `
  query positions {
    bundle(id: "1") {
      ethPriceUSD
    }
    positions(where: { owner_in: ${ownersString} }) {
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
  return gql(queryString)
}

interface PositionsResponse {
  bundle: { ethPriceUSD: any }
  positions: any[]
}

function useAsyncSetFeesHook(positionData: PositionsResponse | undefined, vm: any) {
  const [dataWithFees, setDataWithFees] = useState<any>(undefined)
  const [loadingFees, setLoadingFees] = useState(false)
  const [errorFees, setErrorFees] = useState(false)

  useEffect(() => {
    async function fetchFees() {
      if (positionData) {
        try {
          setLoadingFees(true)
          setErrorFees(false)
          const ethPrice = Number(positionData.bundle.ethPriceUSD)
          const positionsFormatted: { [key: string]: PositionData[] } = {}

          for (const position of positionData.positions) {
            if (!positionsFormatted[position.owner]) {
              positionsFormatted[position.owner] = []
            }

            const overview = new PositionInOverview(position, ethPrice)
            await overview.setFees(position, vm)

            positionsFormatted[position.owner].push({
              tokenId: position.id,
              overview,
              expanded: undefined,
            })
          }
          setDataWithFees(positionsFormatted)
          setLoadingFees(false)
        } catch (error) {
          setLoadingFees(false)
          setErrorFees(true)
        }
      }
    }

    if (!vm || !positionData) {
      setDataWithFees(undefined)
      setLoadingFees(true)
    }

    if (vm && positionData) {
      fetchFees()
    }
  }, [positionData, vm])

  return { dataWithFees, loadingFees, errorFees }
}
/**
 * Fetch top addresses by volume
 */
export function usePositionDatas(
  owners: string[],
  vm: any
): {
  loading: boolean
  error: boolean
  data: { [owner: string]: PositionData[] } | undefined
} {
  // console.log('usePositionDatas')
  // console.log('owners', owners)
  // console.log('vm', vm)

  // get blocks from historic timestamps
  const { loading, error, data } = useQuery<PositionsResponse>(POSITIONS_BULK(owners), {
    fetchPolicy: 'network-only',
  })

  const { dataWithFees, loadingFees, errorFees } = useAsyncSetFeesHook(data, vm)

  // console.log('loading', loading)
  // console.log('error', error)
  // console.log('data', data)
  // console.log('loadingFees', loadingFees)
  // console.log('dataWithFees', dataWithFees)

  // return early if not all data yet or vm is not accessible

  if (!vm || error || errorFees) {
    return {
      loading,
      error: true,
      data: undefined,
    }
  }

  if (loading || loadingFees || !data || !dataWithFees) {
    return {
      loading: true,
      error: false,
      data: undefined,
    }
  }

  if (dataWithFees) {
    // if there is no data for a given address, save empty arr so that we know we dodn't find any positions
    owners.forEach((owner) => {
      if (!Object.keys(dataWithFees).includes(owner)) {
        dataWithFees[owner] = []
      }
    })

    return {
      loading: false,
      error: false,
      data: dataWithFees,
    }
  }

  return {
    loading,
    error: true,
    data: undefined,
  }
}
