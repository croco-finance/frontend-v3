import { createReducer } from '@reduxjs/toolkit'
import { PositionInOverview } from 'data/dashboard/overviewData'
import { Snapshot, Interaction } from 'data/dashboard/expandedData'
import { currentTimestamp } from './../../utils/index'
import { addPositionOwners, updateExtendedData, updatePositionData } from './actions'

export type FeesChartEntry = {
  date: number // e.g. timestamp
  feesToken0: number
  feesToken1: number
  // TODO feesUSD:number
}

export interface ExpandedPositionData {
  dailyFees: FeesChartEntry[]
  snapshots: Snapshot[]
  interactions: Interaction[]
  collectedFeesToken0: number
  collectedFeesToken1: number
  roiUSD: number | undefined
  roiETH: number | undefined
  roiHODL: number | undefined
  apr: number | undefined
}

export interface PositionData {
  tokenId: number
  overview: PositionInOverview
  expanded: ExpandedPositionData | undefined
}

interface PositionsState {
  byOwner: {
    [owner: string]: {
      data: PositionData[] | undefined
      lastUpdated: number | undefined
    }
  }
}

const initialState: PositionsState = {
  byOwner: {},
}

export default createReducer(initialState, (builder) =>
  builder
    // add owners if not included yet
    .addCase(addPositionOwners, (state, { payload: { owners } }) => {
      owners.map((owner) => {
        if (!state.byOwner[owner.toLocaleLowerCase()]) {
          state.byOwner[owner.toLocaleLowerCase()] = {
            data: undefined,
            lastUpdated: undefined,
          }
        }
      })
    })

    .addCase(updatePositionData, (state, { payload: { positions } }) => {
      Object.keys(positions).map((owner) => {
        state.byOwner[owner] = { data: positions[owner], lastUpdated: currentTimestamp() }
      })
    })

    .addCase(updateExtendedData, (state, action) => {
      const { owner, tokenId, data: expandedData } = action.payload
      // find position
      const ownerPositions = state.byOwner[owner].data
      if (ownerPositions) {
        const position = ownerPositions.filter((p: any) => p.tokenId === tokenId)
        position[0].expanded = expandedData
      }
    })
)
