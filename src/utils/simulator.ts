import { getTokenArrayValue } from 'utils/math'
import { Position } from 'state/simulator/reducer'

// compute relative impermanent loss from known current and HOLD value
export function getRelativeImpLoss(poolValue: number, holdValue: number) {
  return 1 - poolValue / holdValue
}

// compute impermanent loss in relative and absolute terms
function getRelativeAndAbsoluteImpLoss(
  tokenReservesCurrentPrice: number[],
  tokenReservesSimulatedPrice: number[],
  simulatedTokenPricesUsd: number[]
) {
  const holdValue = getTokenArrayValue(tokenReservesCurrentPrice, simulatedTokenPricesUsd)
  const poolValue = getTokenArrayValue(tokenReservesSimulatedPrice, simulatedTokenPricesUsd)
  const ilAbsolute = holdValue - poolValue
  const ilRelative = getRelativeImpLoss(poolValue, holdValue)

  return { ilAbsolute, ilRelative }
}

// Amount of tokens deposited to infinite range based on investment amount and token prices
export function getReservesInvestedToInfiniteRange(investment: number, tokenPrices: number[]) {
  // 50% of the investment goes to token_0 and 50% to token_1
  const tokenReserves = new Array(2)
  tokenReserves[0] = investment / 2 / tokenPrices[0]
  tokenReserves[1] = investment / 2 / tokenPrices[1]

  return tokenReserves
}

export function getRealReservesAtLimitPrices(k: number, priceMin: number, priceMax: number) {
  const realTokenReservesAtLimitPriceMin = new Array(2)
  const commonPart = 1 - Math.sqrt(priceMin / priceMax)
  realTokenReservesAtLimitPriceMin[0] = Math.sqrt(k / priceMin) * commonPart // x axis token
  realTokenReservesAtLimitPriceMin[1] = 0

  const realTokenReservesAtLimitPriceMax = new Array(2)
  realTokenReservesAtLimitPriceMax[0] = 0
  realTokenReservesAtLimitPriceMax[1] = Math.sqrt(k * priceMax) * commonPart // y axis token

  return { realTokenReservesAtLimitPriceMin, realTokenReservesAtLimitPriceMax }
}

export function getSimulatedStatsForRange(
  currentTokenPricesUsd: number[],
  simulatedTokenPricesUsd: number[],
  priceMin: number,
  priceMax: number,
  investmentUsd: number
) {
  // NOTE: This function ignores ticks
  // virtual reserves: reserves on infinite interval
  // real reserves: reserves on specified range <priceMin, priceMax>

  // compute price ratio
  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]
  const simulatedPriceRatio = simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1]

  // virtual reserves for current price
  const virtualTokenReservesCurrentPrice = getReservesInvestedToInfiniteRange(investmentUsd, currentTokenPricesUsd)

  // compute constant product
  const k = virtualTokenReservesCurrentPrice[0] * virtualTokenReservesCurrentPrice[1]

  // virtual reserves at range limit prices
  const virtualTokenReservesAtLimitPriceMin = new Array(2)
  virtualTokenReservesAtLimitPriceMin[0] = Math.sqrt(k / priceMin)
  virtualTokenReservesAtLimitPriceMin[1] = Math.sqrt(k * priceMin)

  const virtualTokenReservesAtLimitPriceMax = new Array(2)
  virtualTokenReservesAtLimitPriceMax[0] = Math.sqrt(k / priceMax)
  virtualTokenReservesAtLimitPriceMax[1] = Math.sqrt(k * priceMax)

  // range computations
  // limit amounts
  const realTokenReservesAtLimitPriceMin = new Array(2)
  const commonPart = 1 - Math.sqrt(priceMin / priceMax)
  realTokenReservesAtLimitPriceMin[0] = Math.sqrt(k / priceMin) * commonPart // x axis token
  realTokenReservesAtLimitPriceMin[1] = 0

  const realTokenReservesAtLimitPriceMax = new Array(2)
  realTokenReservesAtLimitPriceMax[0] = 0
  realTokenReservesAtLimitPriceMax[1] = Math.sqrt(k * priceMax) * commonPart // y axis token

  // current amounts (according to the current price)
  const realTokenReservesCurrentPrice = new Array(2)
  realTokenReservesCurrentPrice[0] = virtualTokenReservesCurrentPrice[0] - Math.sqrt(k / priceMax)
  realTokenReservesCurrentPrice[1] = virtualTokenReservesCurrentPrice[1] - Math.sqrt(k * priceMin)

  // compute token balances for simulated price
  const virtualReservesSimulatedPrice = new Array(2)
  virtualReservesSimulatedPrice[0] = Math.sqrt(k / simulatedPriceRatio)
  virtualReservesSimulatedPrice[1] = Math.sqrt(k * simulatedPriceRatio)

  const realTokenReservesSimulatedPrice = new Array(2)
  realTokenReservesSimulatedPrice[0] = virtualReservesSimulatedPrice[0] - Math.sqrt(k / priceMax)
  realTokenReservesSimulatedPrice[1] = virtualReservesSimulatedPrice[1] - Math.sqrt(k * priceMin)

  // if the simulated price is above/below the price range threshold (we don't want to show negative balances)
  if (simulatedPriceRatio > priceMax) {
    realTokenReservesSimulatedPrice[0] = 0
    // eslint-disable-next-line prefer-destructuring
    realTokenReservesSimulatedPrice[1] = realTokenReservesAtLimitPriceMax[1]
  } else if (simulatedPriceRatio < priceMin) {
    // eslint-disable-next-line prefer-destructuring
    realTokenReservesSimulatedPrice[0] = realTokenReservesAtLimitPriceMin[0]
    realTokenReservesSimulatedPrice[1] = 0
  }

  // do the same for current price ratio
  if (currentPriceRatio > priceMax) {
    realTokenReservesCurrentPrice[0] = 0
    // eslint-disable-next-line prefer-destructuring
    realTokenReservesCurrentPrice[1] = realTokenReservesAtLimitPriceMax[1]
  } else if (currentPriceRatio < priceMin) {
    // eslint-disable-next-line prefer-destructuring
    realTokenReservesCurrentPrice[0] = realTokenReservesAtLimitPriceMin[0]
    realTokenReservesCurrentPrice[1] = 0
  }

  // impermanent loss in relative and absolute terms
  const { ilAbsolute, ilRelative } = getRelativeAndAbsoluteImpLoss(
    realTokenReservesCurrentPrice,
    realTokenReservesSimulatedPrice,
    simulatedTokenPricesUsd
  )

  return {
    realTokenReservesCurrentPrice,
    realTokenReservesSimulatedPrice,
    realTokenReservesAtLimitPriceMin,
    realTokenReservesAtLimitPriceMax,
    ilAbsolute,
    ilRelative,
  }
}

/**
 * Returns the closest tick that is nearest a given targetPrice
 * @param targetPrice priceToken0/priceToken1
 */
export const getNearestTick = (targetPrice: number) => {
  // there is a tick at every price 𝑝 that is an integer power of 1.0001
  // the equation: 1.0001^tickInteger = targetPrice;

  // 1. First get float value and then round it to the nearest integer"
  const tickFloat = Math.log(targetPrice) / Math.log(1.0001)

  // 2. Convert float to integer (tick has to be integer)
  return Math.round(tickFloat)
}

export function getCapitalEfficiencyCoefficient(priceMin: number, priceMax: number) {
  return 1 / (1 - (priceMin / priceMax) ** (1 / 4))
}

export const getInvestmentIncreaseCoefficient = (currentTokenPrices: number[], priceMin: number, priceMax: number) => {
  const currentPriceRatio = currentTokenPrices[0] / currentTokenPrices[1]
  // the absolute investment amount doesn't matter. The only important thing are current token price
  // TODO there should probably be an equation how to compute this without the need to provide invested amount
  const fakeInvestment = 1000000

  // virtual reserves for current price
  const virtualTokenReservesCurrentPrice = getReservesInvestedToInfiniteRange(fakeInvestment, currentTokenPrices)

  // compute constant product
  const k = virtualTokenReservesCurrentPrice[0] * virtualTokenReservesCurrentPrice[1]

  // reserves at limit prices
  const { realTokenReservesAtLimitPriceMin, realTokenReservesAtLimitPriceMax } = getRealReservesAtLimitPrices(
    k,
    priceMin,
    priceMax
  )

  // reserves for current price
  // TODO move this computation to reducer as it will not change that often
  const realTokenReservesCurrentPrice = new Array(2)
  realTokenReservesCurrentPrice[0] = virtualTokenReservesCurrentPrice[0] - Math.sqrt(k / priceMax)
  realTokenReservesCurrentPrice[1] = virtualTokenReservesCurrentPrice[1] - Math.sqrt(k * priceMin)

  // do the same for current price ratio
  if (currentPriceRatio > priceMax) {
    realTokenReservesCurrentPrice[0] = 0
    // eslint-disable-next-line prefer-destructuring
    realTokenReservesCurrentPrice[1] = realTokenReservesAtLimitPriceMax[1]
  } else if (currentPriceRatio < priceMin) {
    // eslint-disable-next-line prefer-destructuring
    realTokenReservesCurrentPrice[0] = realTokenReservesAtLimitPriceMin[0]
    realTokenReservesCurrentPrice[1] = 0
  }

  // investment increase coefficient (independent on simulated price)
  const tokenXVirtualValue = fakeInvestment / currentTokenPrices[0]
  const tokenXRealValue = realTokenReservesCurrentPrice[0] + realTokenReservesCurrentPrice[1] / currentPriceRatio
  return tokenXVirtualValue / tokenXRealValue
}

export const getDataForSimulatedDensityChart = (positions: Position[]) => {
  // TODO 1. sort positions from lowest priceMin

  // 3. get the value of highest investment, lowest priceMin and highest priceMax
  let maxInvestment = 0
  let minPriceBottom = Infinity
  let maxPriceTop = 0
  positions.forEach((position) => {
    // TODO what data add if infinite range is selected?
    if (position.investmentUsd > maxInvestment) maxInvestment = position.investmentUsd
    if (position.priceMin < minPriceBottom) minPriceBottom = position.priceMin
    if (position.priceMax > maxPriceTop) maxPriceTop = position.priceMax
  })

  const middlePriceRange = (maxPriceTop + minPriceBottom) / 2
  const xAxisOffset = middlePriceRange - minPriceBottom

  // create data format
  const dataPointsCount = 2 * positions.length + 2
  const liquidityValuesArrLength = 2 * positions.length + 1
  const chartData: ChartDataItem[] = []

  // Get first element of graph data. The rest will be computed using loop
  const initialLiquidityValues = new Array(liquidityValuesArrLength).fill(undefined)

  // initialPoolValues[0] = intervalStats[0].poolValueUsd;
  initialLiquidityValues[0] = 0

  chartData.push({
    price: minPriceBottom - xAxisOffset,
    liquidityValues: initialLiquidityValues,
  })

  // add the data point between
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i]

    const liquidityValuesBottom = new Array(liquidityValuesArrLength).fill(undefined)
    const liquidityValuesTop = new Array(liquidityValuesArrLength).fill(undefined)

    // get end value of pool
    const bottomIndex = 2 * i
    liquidityValuesBottom[bottomIndex] = 0
    liquidityValuesBottom[bottomIndex + 1] = position.investmentUsd

    liquidityValuesTop[bottomIndex + 1] = position.investmentUsd
    liquidityValuesTop[bottomIndex + 2] = 0

    chartData.push({
      price: position.priceMin,
      liquidityValues: liquidityValuesBottom,
    })

    chartData.push({
      price: position.priceMax,
      liquidityValues: liquidityValuesTop,
    })
  }

  // add the last data point
  const lastLiquidityValues = new Array(liquidityValuesArrLength).fill(undefined)
  lastLiquidityValues[liquidityValuesArrLength - 1] = 0
  chartData.push({
    price: maxPriceTop + xAxisOffset,
    liquidityValues: lastLiquidityValues,
  })

  return { chartData, maxInvestment }
}

interface ChartDataItem {
  price: number
  liquidityValues: Array<number | undefined>
}

// should be ordered by price from lowest to highest
// take into account the price ranges can cover each other
const exampleData: ChartDataItem[] = [
  {
    price: 0,
    liquidityValues: [0, undefined, undefined, undefined, undefined, undefined, undefined],
  },
  {
    price: 10,
    liquidityValues: [0, 1000, undefined, undefined, undefined, undefined, undefined],
    // position index: 0; indexBottom = 0
  },
  {
    price: 20,
    liquidityValues: [undefined, 1000, 0, undefined, undefined, undefined, undefined],
    // position index: 0; indexTop = 1
  },
  {
    price: 30,
    liquidityValues: [undefined, undefined, 0, 2000, undefined, undefined, undefined],
    // position index: 1; indexBottom = 2
  },
  {
    price: 40,
    liquidityValues: [undefined, undefined, undefined, 2000, 0],
    // position index: 1; indexTop = 3
  },
  {
    price: 50,
    liquidityValues: [undefined, undefined, undefined, undefined, 0, 5000, undefined],
    // position index: 2; indexBottom = 4
  },
  {
    price: 60,
    liquidityValues: [undefined, undefined, undefined, undefined, undefined, 5000, 0],
    // position index: 2; indexTop = 5
  },
  {
    price: 70,
    liquidityValues: [undefined, undefined, undefined, undefined, undefined, undefined, 0],
  },
]
