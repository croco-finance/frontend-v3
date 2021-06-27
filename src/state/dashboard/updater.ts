import { useAllPositionData, useUpdatePositionData, useAddPositionOwners } from './hooks'
import { useEffect, useMemo } from 'react'
import { useTopTokenAddresses } from '../../data/tokens/topTokens'
import { usePositionDatas } from 'data/dashboard/overviewData'
import { useWatchedAddresses } from 'state/user/hooks'

export default function Updater(): null {
  // updaters
  const updatePositionData = useUpdatePositionData()
  const addPositionOwners = useAddPositionOwners()

  // intitial data
  const watchedAddresses = useWatchedAddresses()
  const allPositionData = useAllPositionData()
  const { loading, error, addresses } = useTopTokenAddresses()

  // add top pools on first load
  useEffect(() => {
    if (watchedAddresses && Object.keys(watchedAddresses).length > 0) {
      addPositionOwners(Object.keys(watchedAddresses))
    }
  }, [allPositionData, addresses, error, loading, watchedAddresses, addPositionOwners])

  // detect for which addresses we havent loaded token data yet
  const unfetchedOwners = useMemo(() => {
    return Object.keys(allPositionData).reduce((accum: string[], key) => {
      const positionsData = allPositionData[key]
      // if there are no possitions (not even ampty array) associated with this user
      if (!positionsData.data || !positionsData.lastUpdated) {
        accum.push(key)
      }
      return accum
    }, [])
  }, [allPositionData])

  // update unloaded pool entries with fetched data
  const { error: positionDataError, loading: positionDataLoading, data: positionDatas } = usePositionDatas(
    unfetchedOwners
  )
  useEffect(() => {
    if (positionDatas && !positionDataError && !positionDataLoading) {
      updatePositionData(positionDatas)
    }
  }, [positionDatas, positionDataError, positionDataLoading, updatePositionData])

  return null
}
