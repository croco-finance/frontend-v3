import { formatAmount } from 'utils/numbers'
import { roundToNDecimals } from 'utils/math'
import React from 'react'
import styled, { css } from 'styled-components'

const rightAlignedStyles = css`
  text-align: right;
  justify-self: flex-end;
`

const leftAlignedStyles = css`
  text-align: left;
  align-items: baseline;
`

const Wrapper = styled.div<{
  textAlign: 'left' | 'right'
  maxHeight: number
  reversedOrder: boolean
}>`
  display: flex;
  flex-direction: ${(props) => (props.reversedOrder ? 'column-reverse' : 'column')};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text3};
  letter-spacing: 0.3px;
  overflow-y: auto;
  max-height: ${(props) => props.maxHeight}px;

  /* content alignment styles */
  ${(props) => (props.textAlign === 'left' ? leftAlignedStyles : rightAlignedStyles)}/* justify-content: center; */
`

const Row = styled.div`
  margin: 2px 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const Amount = styled.div``

const Symbol = styled.div<{ maxWidth: number }>`
  max-width: ${(props) => props.maxWidth}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 5px;
`

interface Props {
  tokenSymbols: Array<string>
  tokenAmounts: Array<number>
  textAlign?: 'left' | 'right'
  usePlusSymbol?: boolean
  maxWidth?: number
  maxHeight?: number
  reversedOrder?: boolean
  roundToDecimals?: number
}

export default function VerticalCryptoAmounts({
  tokenSymbols,
  tokenAmounts,
  textAlign = 'right',
  usePlusSymbol = false,
  maxWidth = 100,
  maxHeight = 160,
  reversedOrder = false,
  roundToDecimals = 2,
}: Props) {
  const tokenSymbolsRendered = tokenSymbols

  // if the user passed just one symbol/amount, convert that number to array so that I can loop through it
  // if (!Array.isArray(props.tokenSymbols)) {
  //     tokenSymbolsRendered = [props.tokenSymbols];
  // } else {
  //     tokenSymbolsRendered = props.tokenSymbols;
  // }

  // if (!Array.isArray(props.tokenAmounts)) {
  //     tokenAmountsRendered = [props.tokenAmounts];
  // } else {
  //     tokenAmountsRendered = props.tokenAmounts;
  // }

  return (
    <Wrapper textAlign={textAlign} maxHeight={maxHeight} reversedOrder={reversedOrder}>
      {tokenSymbolsRendered.map((symbol, i) => (
        <Row key={symbol}>
          <Amount>
            {roundToNDecimals(tokenAmounts[i], roundToDecimals) > 0 && usePlusSymbol ? '+' : null}
            {formatAmount(tokenAmounts[i], 2, true)}
          </Amount>{' '}
          <Symbol maxWidth={maxWidth}>{symbol}</Symbol>
        </Row>
      ))}
    </Wrapper>
  )
}
