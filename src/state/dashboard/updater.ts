import { usePositionDatas } from 'data/dashboard/overviewData'
import { useEffect, useMemo, useState } from 'react'
import { useWatchedAddresses } from 'state/user/hooks'
import { deployContractAndGetVm } from '../../data/dashboard/contractUtils'
import { useTopTokenAddresses } from '../../data/tokens/topTokens'
import { useAddPositionOwners, useAllPositionData, useUpdatePositionData } from './hooks'

export default function Updater() {
  // updaters
  const updatePositionData = useUpdatePositionData()
  const addPositionOwners = useAddPositionOwners()

  // intitial data
  const watchedAddresses = useWatchedAddresses()
  const allPositionData = useAllPositionData()
  const { loading, error, addresses } = useTopTokenAddresses()
  const [vm, setVM] = useState<any>(null)

  // add top pools on first load
  useEffect(() => {
    if (watchedAddresses && Object.keys(watchedAddresses).length > 0) {
      addPositionOwners(Object.keys(watchedAddresses))
    }
  }, [allPositionData, addresses, error, loading, watchedAddresses, addPositionOwners])

  // set VM
  useEffect(() => {
    async function getVM() {
      const vm = await deployContractAndGetVm()
      setVM(vm)
    }

    // get VM if not saved in state
    if (!vm) {
      getVM()
    }
  }, [])

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
    unfetchedOwners,
    vm
  )
  useEffect(() => {
    if (positionDatas && !positionDataError && !positionDataLoading) {
      updatePositionData(positionDatas)
    }
  }, [positionDatas, positionDataError, positionDataLoading, updatePositionData])

  return null
}
