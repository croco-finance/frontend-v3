import { getExpandedPosition } from 'data/dashboard/expandedData'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPositionOwners, updateExtendedData, updatePositionData } from 'state/dashboard/actions'
import { PositionData } from 'state/dashboard/reducer'
import { notEmpty } from 'utils'
import { AppDispatch, AppState } from './../index'

export function useAllPositionData(): {
  [owner: string]: { data: PositionData[] | undefined; lastUpdated: number | undefined }
} {
  return useSelector((state: AppState) => state.positions.byOwner)
}

export function useAddPositionOwners(): (owners: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((owners: string[]) => dispatch(addPositionOwners({ owners })), [dispatch])
}

export function useUpdatePositionData(): (positions: { [owner: string]: PositionData[] }) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (positions: { [owner: string]: PositionData[] }) => {
      dispatch(updatePositionData({ positions }))
    },
    [dispatch]
  )
}

export function usePositionDatas(
  owners: string[] | undefined
): { data: PositionData[] | undefined; latestUpdate: number | undefined } {
  const allPositionsData = useAllPositionData()
  const addPositionOwners = useAddPositionOwners()
  const allTrackedOwners = Object.keys(allPositionsData)

  // if owner not tracked yet track it
  owners?.map((o) => {
    if (!allTrackedOwners.includes(o)) {
      addPositionOwners([o])
    }
  })

  const { data, latestUpdate } = useMemo(() => {
    if (!owners) {
      return { data: undefined, latestUpdate: undefined }
    }
    let allPositions: PositionData[] = []
    let latestTimestamp

    owners.forEach((o) => {
      if (allPositionsData[o]) {
        const data = allPositionsData[o].data
        const ownerLastUpdate = allPositionsData[o].lastUpdated

        if (data) {
          allPositions = allPositions.concat(data)
        }

        if (ownerLastUpdate) latestTimestamp = ownerLastUpdate
      }
    })
    return { data: allPositions.filter(notEmpty), latestUpdate: latestTimestamp }
  }, [owners, allPositionsData])

  return { data, latestUpdate }
}

/**
 * Owner is unncecessary but it makes search for position with given tokenId faster
 * @param owner
 * @param tokenId
 * @returns
 */
export function useExpandedData(owner: string, tokenId: number, vm: any) {
  const dispatch = useDispatch<AppDispatch>()
  const positions = useSelector((state: AppState) => state.positions.byOwner[owner].data)
  // find position with given token id
  const position = positions ? positions.filter((position) => position.tokenId === tokenId)[0] : undefined
  // check if expanded data is available
  const expandedData = position?.expanded
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetch() {
      if (position) {
        const { data, error } = await getExpandedPosition(position.overview, vm)
        if (!error && data) {
          dispatch(updateExtendedData({ owner, tokenId, data }))
        }
        if (error) {
          setError(error)
        }
      }
    }
    if (position && !expandedData && !error) {
      fetch()
    }
  }, [expandedData, dispatch, position, error, tokenId, owner])

  return expandedData
}
