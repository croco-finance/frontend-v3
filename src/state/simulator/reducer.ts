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
} from './actions'

export interface Position {
  investmentUsd: number
  priceMin: number
  priceMax: number
  infiniteRangeSelected: boolean
}
export interface SimulatorState {
  // pool data fetching
  fetchError: boolean
  loading: boolean
  // pool data
  poolId: string
  tokenSymbols: string[]
  tokenAddresses: string[]
  tokenWeights: number[]
  poolTokenReserves: number[] | null
  volume24Usd: number | null
  swapFee: number | null
  currentTokenPricesUsd: number[]
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

const initialPosition: Position = {
  investmentUsd: 0,
  priceMin: 0,
  priceMax: Infinity,
  infiniteRangeSelected: false,
}

const initialState: SimulatorState = {
  // pool data fetching
  fetchError: false,
  loading: false,
  // pool data
  poolId: '',
  tokenSymbols: [],
  tokenAddresses: [],
  tokenWeights: [],
  poolTokenReserves: [],
  volume24Usd: 0,
  swapFee: 0,
  currentTokenPricesUsd: [],
  // simulation data
  simulatedPriceCoefficients: [1, 1],
  defaultSliderPriceCoefficients: [1, 1],
  // initiate the state with one position on infinite price range
  positions: [],
  priceRatioOrder: 'default',
}

const fakeInitialState: SimulatorState = {
  // pool data fetching
  fetchError: false,
  loading: false,
  // pool data
  poolId: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
  tokenSymbols: ['DAI', 'WETH'],
  tokenAddresses: ['0x6B175474E89094C44Da98b954EedeAC495271d0F', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  tokenWeights: [0.5, 0.5],
  poolTokenReserves: [73875146, 29406],
  volume24Usd: 45654504,
  swapFee: 0.03,
  currentTokenPricesUsd: [1, 1500],
  // currentTokenPricesUsd: [1, 3000],
  // simulation data
  simulatedPriceCoefficients: [1, 1],
  defaultSliderPriceCoefficients: [1, 1],
  // initiate the state with one position on infinite price range
  positions: [
    {
      investmentUsd: 1000000,
      priceMin: 1 / 2250,
      priceMax: 1 / 1000,
      infiniteRangeSelected: false,
    },
    // {
    //     investmentUsd: 500000,
    //     priceMin: 1 / 900,
    //     priceMax: 1 / 800,
    //     infiniteRangeSelected: true,
    // },
  ],
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
        swapFee,
        positions,
      } = action.payload
      state.poolId = poolId
      state.tokenSymbols = tokenSymbols
      state.tokenAddresses = tokenAddresses
      state.tokenWeights = tokenWeights
      state.currentTokenPricesUsd = currentTokenPricesUsd
      state.poolTokenReserves = poolTokenReserves
      state.volume24Usd = volume24Usd
      state.swapFee = swapFee
      state.positions = positions
    })
    .addCase(resetSimulationCoefficients, (state, action) => {
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
      state.positions.push({ investmentUsd: 0, priceMin: priceMin, priceMax, infiniteRangeSelected: false })
    })
    .addCase(removePosition, (state, action) => {
      const { positionIndex } = action.payload
      state.positions.splice(positionIndex, 1)
    })
)
