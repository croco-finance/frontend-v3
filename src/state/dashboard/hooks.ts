import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPositionOwners, updatePositionData } from 'state/dashboard/actions'
import { PositionInState } from 'state/dashboard/reducer'
import { notEmpty } from 'utils'
import { AppDispatch, AppState } from './../index'

export function useAllPositionData(): {
  [owner: string]: PositionInState[] | undefined
} {
  return useSelector((state: AppState) => state.dashboard.positions.byOwner)
}

export function useAddPositionOwners(): (owners: string[]) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((owners: string[]) => dispatch(addPositionOwners({ owners })), [dispatch])
}

export function useUpdatePositionData(): (positions: { [owner: string]: PositionInState[] }) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (positions: { [owner: string]: PositionInState[] }) => {
      dispatch(updatePositionData({ positions }))
    },
    [dispatch]
  )
}

export function usePositionDatas(owners: string[] | undefined): PositionInState[] | undefined {
  const allPositionsData = useAllPositionData()
  const addPositionOwners = useAddPositionOwners()
  const allTrackedOwners = Object.keys(allPositionsData)

  // if owner not tracked yet track it
  owners?.map((o) => {
    if (!allTrackedOwners.includes(o)) {
      addPositionOwners([o])
    }
  })

  const data = useMemo(() => {
    if (!owners) {
      return undefined
    }
    let allPositions: PositionInState[] = []
    owners.forEach((o) => {
      const data = allPositionsData[o]
      if (data) {
        allPositions = allPositions.concat(data)
      }
    })
    return allPositions.filter(notEmpty)
  }, [owners, allPositionsData])

  return data
}

// const expandedData = useExpandedData(position)
// export function useExpandedInfo(tokenId: number): any {
//   console.log('useExpandedInfo')
//   const dispatch = useDispatch<AppDispatch>()
//   const positions = useSelector((state: AppState) => state.dashboard.positions)
//   const position = positions.filter((position) => position.tokenId === tokenId)[0]
//   const expandedInfo = position?.expanded
//   const [error, setError] = useState(false)

//   useEffect(() => {
//     async function fetch() {
//       const { data, error } = await getExpandedPosition(position.overview)
//       console.log('getExpandedPosition(), data: ', data)

//       if (!error && data) {
//         dispatch(updateExtendedData({ tokenId, data }))
//       }
//       if (error) {
//         setError(error)
//       }
//     }
//     if (!expandedInfo && !error) {
//       fetch()
//     }
//   }, [expandedInfo, dispatch, position, error, tokenId])

//   return expandedInfo
// }
