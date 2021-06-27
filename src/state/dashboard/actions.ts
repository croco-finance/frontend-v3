import { createAction } from '@reduxjs/toolkit'
import { ExpandedPositionInfo } from 'data/dashboard/positionExpanded'
import { PositionInState } from 'state/dashboard/reducer'

// positions data
export const addPositionOwners = createAction<{ owners: string[] }>('dashboard/addPositionOwners')
export const updatePositionData = createAction<{ positions: { [owner: string]: PositionInState[] } }>(
  'dashboard/updatePositionData'
)
export const updateExtendedData = createAction<{ tokenId: number; data: ExpandedPositionInfo }>(
  'dashboard/addExtendedData'
)
