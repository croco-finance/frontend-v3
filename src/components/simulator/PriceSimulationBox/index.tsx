import React from 'react'
import styled from 'styled-components'
import SimulatePriceRow from './SimulatePriceRow'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { SimulatorState } from 'state/simulator/reducer'
import { formatDollarAmount } from 'utils/numbers'
import CurrencyLogo from 'components/CurrencyLogo'

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg0};
  padding: 24px;
  border-radius: 0 0 10px 10px;
  height: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 18px;
  `}
`

const CurrentPricesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.text5};
`

const CurrentPricesTitle = styled.div`
  display: flex;
  flex-grow: 1;
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin-bottom: 20px;
`

const CurrentPricesValuesWrapper = styled.div<{ priceRatioOrder: SimulatorState['priceRatioOrder'] }>`
  display: flex;
  flex-direction: ${(props) => (props.priceRatioOrder === 'default' ? 'row' : 'row-reverse')};
  justify-content: ${(props) => (props.priceRatioOrder === 'default' ? 'flex-start' : 'flex-end')};
`

const CurrencyLogoWrapper = styled.div`
  margin-right: 4px;
  display: flex;
  align-items: center;
`

const CurrentPricesValue = styled.div`
  color: ${({ theme }) => theme.text2};
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.bg2};
  padding: 8px 12px;
  border-radius: 10px;
  margin-right: 20px;
  font-weight: ${({ theme }) => theme.fontWeight.medium}}
`

const PriceRowsWrapper = styled.div<{ priceRatioOrder: SimulatorState['priceRatioOrder'] }>`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: fit-content;
  word-break: break-word;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  // We don't want to change the order in which items are rendered if priceRatioOrder='reversed'
  // This line of code makes sure the rendering order stays the same
  flex-direction: ${(props) => (props.priceRatioOrder === 'default' ? 'column' : 'column-reverse')};
`

const SubTitlesWrapper = styled.div`
  display: flex;
  margin-bottom: 12px;
  ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text2};
  align-items: center;
`

const SubTitleLeft = styled.div`
  flex-grow: 1;
`

const SubTitleRight = styled.div`
  justify-content: flex-end;
  color: ${({ theme }) => theme.text3};
`

const XScrollWrapper = styled.div`
  overflow-x: auto;
`

interface Props {
  onSliderMoveChange: (value: number, index: number) => void
  onNewDefaultSliderValue: (value: number, index: number) => void
  simulatedCoefficients: number[]
  tokenSymbols: string[]
  tokenAddresses: string[]
  poolId: string
  currentTokenPrices: number[]
}
const PriceSimulationBox = ({
  onSliderMoveChange,
  simulatedCoefficients,
  onNewDefaultSliderValue,
  tokenSymbols,
  tokenAddresses,
  poolId,
  currentTokenPrices,
}: Props) => {
  const { priceRatioOrder } = useAllSimulatorData()

  return (
    <Wrapper>
      <SubTitlesWrapper>
        <SubTitleLeft>Set relative price change</SubTitleLeft>
        <SubTitleRight>Simulated price</SubTitleRight>
      </SubTitlesWrapper>

      <XScrollWrapper>
        <PriceRowsWrapper priceRatioOrder={priceRatioOrder}>
          {tokenSymbols.map((tokenSymbol, i) => (
            <SimulatePriceRow
              // make sure the id is unique to the pool and the token. We want the token sliders
              // to re/render if in the new pool are the same tokens as in the previous pool
              key={`${poolId}${tokenAddresses[i]}`}
              onSliderMoveChange={(newValue) => {
                onSliderMoveChange(newValue, i)
              }}
              onNewDefaultSliderValue={(newValue) => {
                onNewDefaultSliderValue(newValue, i)
              }}
              tokenAddress={tokenAddresses[i]}
              tokenSymbol={tokenSymbol}
              simulatedPrice={currentTokenPrices[i] * simulatedCoefficients[i]}
            />
          ))}
        </PriceRowsWrapper>
      </XScrollWrapper>
      <CurrentPricesWrapper>
        <CurrentPricesTitle>Current prices</CurrentPricesTitle>
        <CurrentPricesValuesWrapper priceRatioOrder={priceRatioOrder}>
          <CurrentPricesValue>
            <CurrencyLogoWrapper>
              <CurrencyLogo address={tokenAddresses[0]} size={'20px'} />
            </CurrencyLogoWrapper>
            {`1 ${tokenSymbols[0]} = ${formatDollarAmount(currentTokenPrices[0])}`}
          </CurrentPricesValue>
          <CurrentPricesValue>
            <CurrencyLogoWrapper>
              <CurrencyLogo address={tokenAddresses[1]} size={'20px'} />
            </CurrencyLogoWrapper>
            {`1 ${tokenSymbols[1]} = ${formatDollarAmount(currentTokenPrices[1])}`}
          </CurrentPricesValue>
        </CurrentPricesValuesWrapper>
      </CurrentPricesWrapper>
    </Wrapper>
  )
}

export default PriceSimulationBox
