import { createAction } from '@reduxjs/toolkit'
import { SimulatorState } from './reducer'

type SetNewDataType = Pick<
  SimulatorState,
  | 'poolId'
  | 'tokenSymbols'
  | 'tokenAddresses'
  | 'tokenWeights'
  | 'currentTokenPricesUsd'
  | 'poolTokenReserves'
  | 'feeTier'
  | 'volume24Usd'
  | 'positions'
  | 'tokenBase'
  | 'tokenQuote'
>

export const setNewSimulationPoolData = createAction<SetNewDataType>('simulator/setNewSimulationPoolData')
export const resetSimulationCoefficients = createAction('simulator/resetSimulationCoefficients')
export const setSimulatedPriceCoefficients = createAction<{ newValue: number; index: number }>(
  'simulator/setSimulatedPriceCoefficients'
)
export const setDefaultSliderPriceCoefficient = createAction<{ newValue: number; index: number }>(
  'simulator/setDefaultSliderPriceCoefficient'
)
export const setPositionMinPrice = createAction<{ price: number; positionIndex: number }>(
  'simulator/setPositionMinPrice'
)
export const setPositionMaxPrice = createAction<{ price: number; positionIndex: number }>(
  'simulator/setPositionMaxPrice'
)
export const switchPriceRatioOrder = createAction('simulator/switchPriceRatioOrder')
export const toggleInfiniteRange = createAction<{ positionIndex: number }>('simulator/toggleInfiniteRange')
export const setPositionInvestedAmount = createAction<{ value: number; positionIndex: number }>(
  'simulator/setPositionInvestedAmount'
)
export const addPosition = createAction('simulator/addPosition')
export const removePosition = createAction<{ positionIndex: number }>('simulator/removePosition')
export const setError = createAction<{ isError: boolean }>('simulator/setError')
