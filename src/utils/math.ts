export function getFirstTwoNonZeroDecimals(value: number) {
  const log10 = value ? Math.floor(Math.log10(value)) : 0
  const div = log10 < 0 ? 10 ** (1 - log10) : 100

  return Math.round(value * div) / div
}

export function roundToNDecimals(value: number, nDecimals: number) {
  const coeff = 10 ** nDecimals
  return Math.round(value * coeff) / coeff
}

export function getAverageDailyRewards(timeStampStartMillis: number, timeStampEndMillis: number, totalReward: number) {
  if (totalReward === 0) return 0
  const differenceMillis = timeStampEndMillis - timeStampStartMillis
  const differenceDays = differenceMillis / (3600 * 24 * 1000)
  return totalReward / differenceDays
}

export function getTokenArrayValue(tokenBalances: number[], tokenPrices: number[]) {
  if (tokenBalances.length !== tokenPrices.length) {
    throw new Error('Arrays have to have the same length')
  }

  let sum = 0
  for (let i = 0; i < tokenBalances.length; i++) {
    sum += tokenBalances[i] * tokenPrices[i]
  }
  return sum
}

export function sumArr(arr: number[]): number {
  // default value is 0
  return arr.reduce((a, b) => a + b, 0)
}

export function multiplyArraysElementWise(arr1: number[], arr2: number[]): number[] {
  // TODO make sure both arrays are the same length
  const result: number[] = new Array(arr1.length)

  arr1.forEach((num, i) => {
    result[i] = arr1[i] * arr2[i]
  })

  return result
}

export function getArrayAverage(arr: number[]): number {
  const arraySum = sumArr(arr)

  return arraySum / arr.length
}

export function divideArraysElementWise(arr1: number[], arr2: number[]): number[] {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays have to have the same length')
  }

  const result = new Array(arr1.length)

  arr1.forEach((num, i) => {
    if (arr2[i] === 0) {
      result[i] = Infinity
    } else {
      result[i] = arr1[i] / arr2[i]
    }
  })

  return result
}

export function sumArraysElementWise(arr1: number[], arr2: number[]): number[] {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays have to have the same length')
  }
  const result: number[] = new Array(arr1.length)

  arr1.forEach((num, i) => {
    result[i] = arr1[i] + arr2[i]
  })

  return result
}

export function subtractArraysElementWise(arr1: number[], arr2: number[]): number[] {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays have to have the same length')
  }
  const result: number[] = new Array(arr1.length)

  arr1.forEach((num, i) => {
    result[i] = arr1[i] - arr2[i]
  })

  return result
}

export function divideEachArrayElementByValue(arr: number[], value: number) {
  const modifiedArr = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    modifiedArr[i] = arr[i] / value
  }

  return modifiedArr
}

export function multiplyEachArrayElementByValue(arr: number[], value: number) {
  const modifiedArr = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    modifiedArr[i] = arr[i] * value
  }

  return modifiedArr
}

export function sumArrayOfTokenArrays(tokenArr: Array<Array<number>>) {
  const tokenCount = tokenArr[0].length
  let tokenAmountsSum = new Array(tokenCount).fill(0)

  tokenArr.forEach((arr) => {
    tokenAmountsSum = sumArraysElementWise(tokenAmountsSum, arr)
  })

  return tokenAmountsSum
}

export function arraysContainEqualElements(_arr1: string[], _arr2: string[]) {
  if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
    return false
  }

  const arr1 = _arr1.concat().sort()
  const arr2 = _arr2.concat().sort()

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}
