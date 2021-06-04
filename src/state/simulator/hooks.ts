import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from './../index'
import { switchPriceRatioOrder, toggleInfiniteRange } from './actions'
import { SimulatorState } from './reducer'

export function useAllSimulatorData(): SimulatorState {
  return useSelector((state: AppState) => state.simulator)
}

export function useSwitchPriceRatioOrder() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(switchPriceRatioOrder()), [dispatch])
}

export function useToggleInfiniteRange(positionIndex: number) {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(toggleInfiniteRange({ positionIndex })), [dispatch])
}
