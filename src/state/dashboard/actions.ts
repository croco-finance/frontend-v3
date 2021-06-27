import { createAction } from '@reduxjs/toolkit'
import { ExpandedPositionInfo } from 'data/dashboard/positionExpanded'
import { PositionData } from 'state/dashboard/reducer'

// positions data
export const addPositionOwners = createAction<{ owners: string[] }>('positions/addPositionOwners')
export const updatePositionData = createAction<{ positions: { [owner: string]: PositionData[] } }>(
  'positions/updatePositionData'
)
export const updateExtendedData = createAction<{ tokenId: number; data: ExpandedPositionInfo }>(
  'positions/addExtendedData'
)
