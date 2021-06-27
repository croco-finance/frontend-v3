import { createReducer } from '@reduxjs/toolkit'
import { ExpandedPositionInfo } from 'data/dashboard/positionExpanded'
import { PositionInOverview } from 'data/dashboard/positionsOverview'
import { updateExtendedData, addPositionOwners, updatePositionData } from './actions'

export interface PositionInState {
  tokenId: number
  overview: PositionInOverview
  expanded: ExpandedPositionInfo | undefined
}

export interface DashboardState {
  positions: { byOwner: { [key: string]: PositionInState[] | undefined } }
  // positions: PositionInState[]
}

const initialState: DashboardState = {
  positions: { byOwner: {} },
  // positions: [],
}

export default createReducer(
  initialState,
  (builder) =>
    builder
      // add owners if not included yet
      .addCase(addPositionOwners, (state, { payload: { owners } }) => {
        owners.map((owner) => {
          if (!state.positions.byOwner[owner.toLocaleLowerCase()]) {
            state.positions.byOwner[owner.toLocaleLowerCase()] = undefined
          }
        })
      })

      .addCase(updatePositionData, (state, { payload: { positions } }) => {
        Object.keys(positions).map((owner) => {
          state.positions.byOwner[owner] = positions[owner]
        })
      })

  // .addCase(updateExtendedData, (state, action) => {
  //   const { tokenId } = action.payload
  //   const position = state.positions.filter((p: any) => p.tokenId === tokenId)
  //   position[0].expanded = action.payload.data
  // })
)
