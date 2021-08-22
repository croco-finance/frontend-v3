import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { Pool, Position } from '@uniswap/v3-sdk'
import { clientCroco as client } from 'apollo/client'
import dayjs from 'dayjs'
import { formatUnits } from 'ethers/lib/utils'
import gql from 'graphql-tag'
import { FeesChartEntry } from 'state/dashboard/reducer'
import { computeFees, DailyFees } from './dailyFees'
import { PositionInOverview, TokenFees } from './overviewData'

export interface Transaction {
  id: string // tx hash
  timestamp: number
  txCostETH: number
  ethPriceUSD: number // price of ETH at the time this transaction happened
}

export interface Snapshot {
  // how many tokens did the user deposit in a given position
  depositedToken0: number
  depositedToken1: number

  // how many tokens did the user withdraw from a given position
  withdrawnToken0: number
  withdrawnToken1: number

  // how many fees did the user collect
  collectedFeesToken0: number
  collectedFeesToken1: number

  // How many tokens did the user have after the change that invoked this snapshot happened
  amountToken0: CurrencyAmount<Token>
  amountToken1: CurrencyAmount<Token>

  priceToken0: number
  priceToken1: number

  // Transaction related to this snapshot
  transaction: Transaction
}

export enum InteractionType {
  DEPOSIT,
  WITHDRAW,
  COLLECT,
}

export class Interaction {
  readonly type: InteractionType
  readonly amountToken0: number
  readonly amountToken1: number
  readonly transaction: Transaction
  readonly valueUSD: number
  readonly snap: Snapshot

  constructor(curSnap: Snapshot, prevSnap: Snapshot | undefined, afterWithdraw = false) {
    this.snap = curSnap
    if (prevSnap === undefined) {
      this.type = InteractionType.DEPOSIT
      this.amountToken0 = curSnap.depositedToken0
      this.amountToken1 = curSnap.depositedToken1
    } else if (afterWithdraw) {
      this.type = InteractionType.COLLECT
      this.amountToken0 = curSnap.collectedFeesToken0 - prevSnap.collectedFeesToken0
      this.amountToken1 = curSnap.collectedFeesToken1 - prevSnap.collectedFeesToken1
    } else if (
      prevSnap.depositedToken0 !== curSnap.depositedToken0 ||
      prevSnap.depositedToken1 !== curSnap.depositedToken1
    ) {
      this.type = InteractionType.DEPOSIT
      this.amountToken0 = curSnap.depositedToken0 - prevSnap.depositedToken0
      this.amountToken1 = curSnap.depositedToken1 - prevSnap.depositedToken1
    } else if (
      prevSnap.withdrawnToken0 !== curSnap.withdrawnToken0 ||
      prevSnap.withdrawnToken1 !== curSnap.withdrawnToken1
    ) {
      this.type = InteractionType.WITHDRAW
      this.amountToken0 = curSnap.withdrawnToken0 - prevSnap.withdrawnToken0
      this.amountToken1 = curSnap.withdrawnToken1 - prevSnap.withdrawnToken1
    } else {
      this.type = InteractionType.COLLECT
      this.amountToken0 = curSnap.collectedFeesToken0 - prevSnap.collectedFeesToken0
      this.amountToken1 = curSnap.collectedFeesToken1 - prevSnap.collectedFeesToken1
    }
    this.transaction = curSnap.transaction
    this.valueUSD = this.amountToken0 * curSnap.priceToken0 + this.amountToken1 * curSnap.priceToken1
  }
}

export interface ExpandedPositionInfo {
  // Sum of all collected fees
  collectedFeesToken0: number
  collectedFeesToken1: number

  // everything is since the last deposit or withdrawal
  // undefined for closed positions
  roiUSD: number | undefined
  roiETH: number | undefined
  roiHODL: number | undefined
  apr: number | undefined

  dailyFees: DailyFees
  snapshots: Snapshot[]
  interactions: Interaction[]
}

const POSITION_AND_SNAPS = gql`
  query positionAndSnaps($positionId: String) {
    position(id: $positionId) {
      pool {
        id
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
    }
    positionSnapshots(where: { position: $positionId }, orderBy: timestamp, orderDirection: asc) {
      blockNumber
      timestamp
      liquidity
      depositedToken0
      depositedToken1
      withdrawnToken0
      withdrawnToken1
      collectedFeesToken0
      collectedFeesToken1
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
      transaction {
        id
        gasUsed
        gasPrice
      }
    }
  }
`

function buildQuery(pool: string, minTimestamp: number, relevantTickIds: string[], snapBlocks: string[]): string {
  let query = `{
          poolDayDatas(where: {pool: "${pool}", date_gt: ${minTimestamp}}, orderBy: date, orderDirection: asc) {
              date
              tick
              feeGrowthGlobal0X128
              feeGrowthGlobal1X128
          }`
  for (const block of snapBlocks) {
    query += `
    b${block}: bundle(id: "1", block: {number: ${block}}) {
      ethPriceUSD
  }
  s${block}: pool(id: "${pool}", block: {number: ${block}}) {
      liquidity
      sqrtPrice
      tick
      token0 {
        derivedETH
      }
      token1 {
          derivedETH
      }
  }`
  }
  for (const tickId of relevantTickIds) {
    const processedId = tickId.replace('#', '_').replace('-', '_')
    query += `
      t${processedId}: tickDayDatas(where: {tick: "${tickId}", date_gt: ${minTimestamp}}, orderBy: date, orderDirection: desc) {
          date
          tick {
              tickIdx
          }
          feeGrowthOutside0X128
          feeGrowthOutside1X128
      }`
    query += `
      t${processedId}_first_smaller: tickDayDatas(first: 1, where: {tick: "${tickId}", date_lte: ${minTimestamp}}, orderBy: date, orderDirection: desc) {
          date
          tick {
              tickIdx
          }
          feeGrowthOutside0X128
          feeGrowthOutside1X128
      }`
  }
  query += '}'
  return query
}

function getInteractions(snaps: Snapshot[]): Interaction[] {
  const interactions: Interaction[] = []
  for (let i = 0; i < snaps.length; i++) {
    const interaction = new Interaction(snaps[i], snaps[i - 1])
    interactions.push(interaction)
    if (interaction.type === InteractionType.WITHDRAW) {
      // Withdraw is always accompanied by collect. For this reason, I will
      // create another interaction of type collect from the same snaps
      interactions.push(new Interaction(snaps[i], snaps[i - 1], true))
    }
  }
  return interactions
}

function dailyFeesToChartFormat(dailyFees: DailyFees, decimals0: number, decimals1: number): FeesChartEntry[] {
  const entryArray: FeesChartEntry[] = []
  for (const timestamp in dailyFees) {
    const tokenFees: TokenFees = dailyFees[timestamp]
    entryArray.push({
      date: Number(timestamp) * 1000,
      feesToken0: Number(formatUnits(tokenFees.amount0, decimals0)),
      feesToken1: Number(formatUnits(tokenFees.amount1, decimals1)),
    })
  }
  return entryArray
}

export async function getExpandedPosition(positionInOverview: PositionInOverview, vm: any) {
  let error = false

  try {
    // 1. get position and snaps
    let result = await client.query({
      query: POSITION_AND_SNAPS,
      variables: {
        positionId: positionInOverview.tokenId.toString(),
      },
    })

    const poolId = result.data.position.pool.id
    const rawPosition = result.data.position
    const rawSnaps = result.data.positionSnapshots

    // 2. create tick ids from tick indexes and pool address
    const relevantTicks: string[] = [
      poolId.concat('#').concat(rawPosition.tickLower.tickIdx),
      poolId.concat('#').concat(rawPosition.tickUpper.tickIdx),
    ]

    // 3. get the time from which to fetch day data and snap blocks
    const snapBlocks: string[] = []
    let oldestSnapTimestamp = Number.MAX_VALUE
    for (const snap of rawSnaps) {
      snapBlocks.push(snap.blockNumber)
      const snapTimestamp = Number(snap.timestamp)
      if (snapTimestamp < oldestSnapTimestamp) {
        oldestSnapTimestamp = snapTimestamp
      }
    }
    const minTimestamp = Math.max(dayjs().subtract(365, 'day').unix(), oldestSnapTimestamp)

    // 4. fetch positions, snapshots, pool, tick day data and eth prices in snap creation times
    result = await client.query({
      query: gql(buildQuery(poolId, minTimestamp, relevantTicks, snapBlocks)),
    })

    // 5. compute daily fees from all the data
    const dailyFees = await computeFees(result.data, rawPosition, rawSnaps, vm)

    // 6. process snapshots
    const snapshots: Snapshot[] = []
    for (const snap of rawSnaps) {
      const additionalPoolInfo = result.data['s' + snap.blockNumber]
      // additionalPoolInfo.tick is null when the positionSnapshot is the pool's
      // first snapshot. To avoid "Error: Invariant failed: TICK" error
      // I set current pool info instead of the snap's
      let pool = positionInOverview.pool
      if (additionalPoolInfo.tick !== null) {
        pool = new Pool(
          positionInOverview.pool.token0,
          positionInOverview.pool.token1,
          positionInOverview.pool.fee,
          additionalPoolInfo.sqrtPrice,
          additionalPoolInfo.liquidity,
          parseInt(additionalPoolInfo.tick)
        )
      }

      const snapPosition = new Position({
        pool,
        liquidity: snap.liquidity,
        tickLower: positionInOverview.tickLower,
        tickUpper: positionInOverview.tickUpper,
      })

      const transaction: Transaction = {
        id: snap.transaction.id,
        timestamp: Number(snap.timestamp),
        txCostETH: Number(snap.transaction.gasUsed) * Number(snap.transaction.gasPrice),
        ethPriceUSD: Number(result.data['b' + snap.blockNumber].ethPriceUSD),
      }

      snapshots.push({
        depositedToken0: Number(snap.depositedToken0),
        depositedToken1: Number(snap.depositedToken1),
        withdrawnToken0: Number(snap.withdrawnToken0),
        withdrawnToken1: Number(snap.withdrawnToken1),
        collectedFeesToken0: Number(snap.collectedFeesToken0),
        collectedFeesToken1: Number(snap.collectedFeesToken1),
        amountToken0: snapPosition.amount0,
        amountToken1: snapPosition.amount1,
        priceToken0: Number(additionalPoolInfo.token0.derivedETH) * transaction.ethPriceUSD,
        priceToken1: Number(additionalPoolInfo.token1.derivedETH) * transaction.ethPriceUSD,
        transaction,
      })
    }

    // Get latest deposit or withdrawal - in order to have info from roi etc.
    const collectedFeesToken0 = snapshots[snapshots.length - 1].collectedFeesToken0
    const collectedFeesToken1 = snapshots[snapshots.length - 1].collectedFeesToken1

    const interactions = getInteractions(snapshots)

    let roiUSD, roiETH, roiHODL, apr
    if (positionInOverview.liquidityUSD !== 0) {
      // ROI related operations
      // Last deposit or withdraw snap
      const snapStart = interactions.reverse().find((interaction) => {
        return interaction.type === InteractionType.DEPOSIT || interaction.type === InteractionType.WITHDRAW
      })!.snap
      const amount0Start = Number(snapStart.amountToken0.toSignificant()) + snapStart.collectedFeesToken0
      const amount1Start = Number(snapStart.amountToken1.toSignificant()) + snapStart.collectedFeesToken1

      const amount0End =
        Number(positionInOverview.amount0.toSignificant()) +
        collectedFeesToken0 +
        positionInOverview.uncollectedFeesToken0!
      const amount1End =
        Number(positionInOverview.amount1.toSignificant()) +
        collectedFeesToken1 +
        positionInOverview.uncollectedFeesToken1!

      const startUSD = amount0Start * snapStart.priceToken0 + amount1Start * snapStart.priceToken1
      const endUSD = amount0End * positionInOverview.token0priceUSD + amount1End * positionInOverview.token1priceUSD

      const startETH = startUSD / snapStart.transaction.ethPriceUSD
      const endETH = endUSD / positionInOverview.ethPriceUSD

      roiUSD = (endUSD - startUSD) / startUSD
      roiETH = (endETH - startETH) / startETH

      const endHODLUSD =
        amount0Start * positionInOverview.token0priceUSD + amount1Start * positionInOverview.token1priceUSD
      roiHODL = (endHODLUSD - startUSD) / startUSD

      const timePeriodInYears = dayjs().diff(dayjs.unix(snapStart.transaction.timestamp), 'year', true)
      apr = roiUSD / timePeriodInYears
    }

    // 7. create ExpandedPositionInfo and return
    return {
      data: {
        collectedFeesToken0,
        collectedFeesToken1,
        roiUSD,
        roiETH,
        roiHODL,
        apr,
        dailyFees: dailyFeesToChartFormat(
          dailyFees,
          positionInOverview.pool.token0.decimals,
          positionInOverview.pool.token1.decimals
        ),
        snapshots,
        interactions: getInteractions(snapshots),
      },
      error,
    }
  } catch {
    error = true
  }

  // 7. create ExpandedPositionInfo and return
  return {
    data: null,
    error,
  }
}
