import { createReducer } from '@reduxjs/toolkit'
import {
  setNewSimulationPoolData,
  resetSimulationCoefficients,
  setSimulatedPriceCoefficients,
  setDefaultSliderPriceCoefficient,
  setPositionMinPrice,
  setPositionMaxPrice,
  switchPriceRatioOrder,
  toggleInfiniteRange,
  setPositionInvestedAmount,
  addPosition,
  removePosition,
  setError,
} from './actions'

// creates unique id for a position
function makeid(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export interface TokenSimulator {
  name: string
  symbol: string
  address: string
  decimals: number
  derivedETH: number
}

export interface Position {
  id: string
  investmentUsd: number
  priceMin: number
  priceMax: number
  infiniteRangeSelected: boolean
}
export interface SimulatorState {
  // pool data fetching
  error: boolean
  loading: boolean
  // pool data
  poolId: string
  tokenSymbols: string[]
  tokenAddresses: string[]
  tokenWeights: number[]
  poolTokenReserves: number[] | null
  volume24Usd: number | null
  feeTier: number | null
  currentTokenPricesUsd: number[]
  tokenBase: TokenSimulator | undefined
  tokenQuote: TokenSimulator | undefined
  // simulation data
  simulatedPriceCoefficients: number[]
  defaultSliderPriceCoefficients: number[]
  // user's positions
  positions: Position[]
  // in which order to show price ratio
  // default is priceToken[0] / priceToken[1]
  // reverse is priceToken[1] / priceToken[0]
  // price ratio order probably should not be specific to position because if every position uses
  // different order, it would be confusing in summary of all positions
  priceRatioOrder: 'default' | 'reversed'
}

const initialState: SimulatorState = {
  // pool data fetching
  error: false,
  loading: false,
  // pool data
  poolId: '',
  tokenSymbols: [],
  tokenAddresses: [],
  tokenWeights: [],
  poolTokenReserves: [],
  volume24Usd: 0,
  feeTier: 0,
  currentTokenPricesUsd: [],
  tokenBase: undefined,
  tokenQuote: undefined,
  // simulation data
  simulatedPriceCoefficients: [1, 1],
  defaultSliderPriceCoefficients: [1, 1],
  // initiate the state with one position on infinite price range
  positions: [],
  priceRatioOrder: 'default',
}

const MAX_PRICE_MULTIPLIER = 1.5
const MIN_PRICE_MULTIPLIER = 0.5

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setNewSimulationPoolData, (state, action) => {
      const {
        poolId,
        tokenSymbols,
        tokenAddresses,
        tokenWeights,
        currentTokenPricesUsd,
        poolTokenReserves,
        volume24Usd,
        feeTier,
        positions,
        tokenBase,
        tokenQuote,
      } = action.payload
      state.poolId = poolId
      state.tokenSymbols = tokenSymbols
      state.tokenAddresses = tokenAddresses
      state.tokenWeights = tokenWeights
      state.currentTokenPricesUsd = currentTokenPricesUsd
      state.poolTokenReserves = poolTokenReserves
      state.volume24Usd = volume24Usd
      state.feeTier = feeTier
      state.positions = positions
      state.simulatedPriceCoefficients = [1, 1]
      state.defaultSliderPriceCoefficients = [1, 1]
      state.tokenBase = tokenBase
      state.tokenQuote = tokenQuote
      state.priceRatioOrder = 'default'
    })
    .addCase(resetSimulationCoefficients, (state, _) => {
      const tokenCount = state.simulatedPriceCoefficients.length
      state.simulatedPriceCoefficients = new Array(tokenCount).fill(1)
      state.defaultSliderPriceCoefficients = new Array(tokenCount).fill(1)
    })
    // TODO double check this
    .addCase(setSimulatedPriceCoefficients, (state, action) => {
      const { newValue, index } = action.payload
      const coefficientsArrCopy = [...state.simulatedPriceCoefficients]
      coefficientsArrCopy[index] = newValue
      state.simulatedPriceCoefficients = coefficientsArrCopy
    })
    .addCase(setDefaultSliderPriceCoefficient, (state, action) => {
      const { newValue, index } = action.payload
      const coefficientsArrCopy = [...state.defaultSliderPriceCoefficients]
      coefficientsArrCopy[index] = newValue
      state.defaultSliderPriceCoefficients = coefficientsArrCopy
    })
    .addCase(setPositionMinPrice, (state, action) => {
      const { price, positionIndex } = action.payload
      state.positions[positionIndex].priceMin = price
    })
    .addCase(setPositionMaxPrice, (state, action) => {
      const { price, positionIndex } = action.payload
      state.positions[positionIndex].priceMax = price
    })
    .addCase(switchPriceRatioOrder, (state) => {
      const { priceRatioOrder, currentTokenPricesUsd } = state

      if (priceRatioOrder === 'default') state.priceRatioOrder = 'reversed'
      if (priceRatioOrder === 'reversed') state.priceRatioOrder = 'default'
      // change the order of all token-related arrays
      state.tokenSymbols.reverse()
      state.tokenAddresses.reverse()
      state.tokenWeights.reverse()
      state.currentTokenPricesUsd.reverse()
      state.poolTokenReserves?.reverse()
      state.simulatedPriceCoefficients.reverse()
      state.defaultSliderPriceCoefficients.reverse()
      // go through all positions and change bottom/top prices according to the new price reference
      state.positions.forEach((position) => {
        let newTop
        let newBottom

        // make sure you don't divide by 0
        if (position.priceMin === 0) {
          newTop = MAX_PRICE_MULTIPLIER * (currentTokenPricesUsd[0] / currentTokenPricesUsd[1])
        } else {
          newTop = 1 / position.priceMin
        }

        if (position.priceMax === 0) {
          newBottom = 0
        } else {
          newBottom = 1 / position.priceMax
        }

        // set new prices
        position.priceMin = newBottom
        position.priceMax = newTop
      })
    })
    .addCase(toggleInfiniteRange, (state, action) => {
      const { positionIndex } = action.payload
      const currentValue = state.positions[positionIndex].infiniteRangeSelected

      // I do not change the priceMin and priceMax values, so they don't get deleted when user changes toggle infinite range
      state.positions[positionIndex].infiniteRangeSelected = !currentValue
    })
    .addCase(setPositionInvestedAmount, (state, action) => {
      const { value, positionIndex } = action.payload
      state.positions[positionIndex].investmentUsd = value
    })
    .addCase(addPosition, (state) => {
      // get current price
      const { currentTokenPricesUsd } = state
      // compute intial maxPrice value
      const priceMax = MAX_PRICE_MULTIPLIER * (currentTokenPricesUsd[0] / currentTokenPricesUsd[1])
      const priceMin = MIN_PRICE_MULTIPLIER * (currentTokenPricesUsd[0] / currentTokenPricesUsd[1])
      const id = makeid(5)
      state.positions.push({ id, investmentUsd: 0, priceMin: priceMin, priceMax, infiniteRangeSelected: false })
    })
    .addCase(removePosition, (state, action) => {
      const { positionIndex } = action.payload
      state.positions.splice(positionIndex, 1)
    })
    .addCase(setError, (state, action) => {
      state.error = action.payload.isError
    })
)
