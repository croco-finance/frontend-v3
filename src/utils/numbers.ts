import numbro from 'numbro'

export function getNumberSign(value: number) {
  if (Number.isNaN(value)) {
    throw new Error('Value is not a number')
  }
  if (value === 0) {
    return ''
  }
  if (value < 0) {
    return '-'
  }
  return '+'
}
// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 2, round = true, signed = false) => {
  if (num === 0) return '$0.00'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3 && !signed) {
    return '<$0.001'
  }

  const returnValue = numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })

  if (signed && num > 0) return `+${returnValue}`
  return returnValue
}

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2, signed = false) => {
  if (num === 0) return '0'
  if (!num) return '-'
  if (num < 0.001 && !signed) {
    return '<0.001'
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}

export function toTwoNonZeroDecimals(n: number) {
  const log10 = n ? Math.floor(Math.log10(n)) : 0
  // eslint-disable-next-line no-restricted-properties
  const div = log10 < 0 ? Math.pow(10, 1 - log10) : 100

  return Math.round(n * div) / div
}

export function countDecimals(value: number) {
  if (Number.isNaN(value)) {
    throw new Error('Value is not a number')
  }

  if (Math.floor(value) === value) return 0
  return value.toString().split('.')[1].length || 0
}

export function formatPercentageValue(value: number, hideDecimals = false, usePlusSymbol = false) {
  const sign = getNumberSign(value)
  if (usePlusSymbol) {
    value = Math.abs(value)
  }

  const percentageFormat = 100 * value
  const numOfDecimals = countDecimals(percentageFormat)

  if (numOfDecimals === 0 && hideDecimals) {
    return `${percentageFormat.toFixed(0)}%`
  }

  if (usePlusSymbol) {
    return `${sign} ${percentageFormat.toFixed(2)}%`
  }
  return `${percentageFormat.toFixed(2)}%`
}

export function getSignedValue(value: number) {
  const sign = getNumberSign(value)
  if (sign === '') return value
  if (sign === '-') return `- ${-value}`
  return `${sign} ${-value}`
}

export function formatSignedDollarAmount(value: number) {
  const sign = getNumberSign(value)
  if (sign === '') return formatDollarAmount(value)
  if (sign === '-') return `- ${formatDollarAmount(-value)}`
  return `${sign} ${formatDollarAmount(-value)}`
}

export function roundToNDecimals(value: number, decimals: number) {
  const decimalsCount = countDecimals(value)
  const coeff = decimalsCount < decimals ? 10 ** decimalsCount : 10 ** decimals
  return Math.round(value * coeff) / coeff
}

export function getPositionOfFirstNonZeroDecimal(value: number) {
  // get the decimal part only
  const decimals = value % 1
  // if there are no decimals, return -1
  if (decimals === 0) return -1
  // otherwise return decimals position (ex. for 10.03 return 1)
  return -Math.floor(Math.log10(decimals))
}

export function formatNumber(value: number) {
  // get the decimal part only
  const firstDecimalPosition = getPositionOfFirstNonZeroDecimal(value)

  if (firstDecimalPosition > 5) return value.toFixed(firstDecimalPosition)
  if (firstDecimalPosition >= 2) {
    const tmp = value.toFixed(firstDecimalPosition + 1)
    // check if te last number of tmp is zero. If so, do not return it
    if (tmp.charAt(tmp.length - 1) === '0') {
      return value.toFixed(firstDecimalPosition)
    } else {
      return tmp
    }
  }
  return value.toFixed(2)
}
