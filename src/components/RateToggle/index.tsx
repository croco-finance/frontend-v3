import { Token } from '@uniswap/sdk-core'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import React from 'react'

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function RateToggle({
  currencyA,
  currencyB,
  handleRateToggle,
  width,
  height,
}: {
  currencyA: Token
  currencyB: Token
  handleRateToggle: () => void
  width?: string
  height?: string
}) {
  const tokenA = currencyA
  const tokenB = currencyB

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB)

  return tokenA && tokenB ? (
    <div style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }} onClick={handleRateToggle}>
      <ToggleWrapper width={width ? width : 'fit-content'} height={height ? height : '100%'}>
        <ToggleElement isActive={isSorted} fontSize="12px">
          {isSorted ? currencyA.symbol : currencyB.symbol} price
        </ToggleElement>
        <ToggleElement isActive={!isSorted} fontSize="12px">
          {isSorted ? currencyB.symbol : currencyA.symbol} price
        </ToggleElement>
      </ToggleWrapper>
    </div>
  ) : null
}
