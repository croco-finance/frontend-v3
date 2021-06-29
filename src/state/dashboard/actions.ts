import { createAction } from '@reduxjs/toolkit'
import { PositionData, ExpandedPostionData } from 'state/dashboard/reducer'

// positions data
export const addPositionOwners = createAction<{ owners: string[] }>('positions/addPositionOwners')
export const updatePositionData = createAction<{ positions: { [owner: string]: PositionData[] } }>(
  'positions/updatePositionData'
)
export const updateExtendedData = createAction<{ owner: string; tokenId: number; data: ExpandedPostionData }>(
  'positions/addExtendedData'
)
