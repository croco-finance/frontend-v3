import { ButtonOutlined } from 'components/Button'
import InlineCircle from 'components/InlineCircle'
import VerticalCryptoAmounts from 'components/VerticalCryptoAmounts'
import React from 'react'
import { useDispatch } from 'react-redux'
import { removePosition } from 'state/simulator/actions'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { Position } from 'state/simulator/reducer'
import styled, { css } from 'styled-components'
import { getTokenArrayValue, multiplyArraysElementWise, subtractArraysElementWise } from 'utils/math'
import { formatDollarAmount, formatPercentageValue, getNumberSign, roundToNDecimals } from 'utils/numbers'
import {
  getCapitalEfficiencyCoefficient,
  getInvestmentIncreaseCoefficient,
  getSimulatedStatsForRange,
} from 'utils/simulator'
import GridRow from './GridRow'
import useTheme from 'hooks/useTheme'

const Wrapper = styled.div`
  display: flex;
  flex-direction column;
  color: ${({ theme }) => theme.text1};
  width: 100%;
`

const GridWrapper = styled.div`
  flex-grow: 1;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(100px, auto) minmax(110px, auto) minmax(120px, auto) 125px;
  grid-auto-rows: auto;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  align-items: center;
  /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
  /* overflow-x: auto; */
  word-break: break-word;
  align-items: baseline;
  width: 100%;
  min-width: fit-content;

  //   @media (max-width: 500px) {
  //     font-size: ${({ theme }) => theme.fontSize.small};;
  //     gap: 18px 5px;
  //     /* grid-template-columns: 140px minmax(90px, auto) minmax(90px, auto); */
  //   }
`

const RightPaddingWrapper = styled.div`
  padding-right: 10px;
`

const PoolValueCryptoFiatWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const PoolValueCryptoFiatWrapperBorder = styled(PoolValueCryptoFiatWrapper)`
  padding-right: 10px;
`

const AdditionalInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  padding-top: 10px;
  margin-top: 20px;
`

const AddRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`

const AddTitle = styled.div`
  display: flex;
  flex-grow: 1;
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin-top: 10px;
`

const IlValuesWrapper = styled.div`
  display: flex;
  align-items: center;
`

const IlRelative = styled.div`
  color: ${({ theme }) => theme.text3};
  padding-right: 20px;
  margin-right: 20px;
`
const IlAbsolute = styled.div`
  color: ${({ theme }) => theme.text2};
  min-width: 120px;
  text-align: right;
`

const PositionStatus = styled.div`
  color: ${({ theme }) => theme.text3};
`

const RemovePositionWrapper = styled.div`
  display: flex;
  height: 40px;
  width: 200px;
  align-self: flex-end;
  margin-top: 20px;
`

const FiatDifference = styled.div<{ sign: '+' | '-' | '' }>`
  ${(props) => {
    if (props.sign === '+')
      return css`
        color: ${props.theme.green1};
      `

    if (props.sign === '-')
      return css`
        color: ${props.theme.red1};
      `

    return css`
      color: ${props.theme.text2};
    `
  }}
`

interface Props {
  positionIndex: number
  investmentUsd: Position['investmentUsd']
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
  infiniteRangeSelected: Position['infiniteRangeSelected']
}

export default function PositionOverview({
  positionIndex,
  investmentUsd,
  priceMin,
  priceMax,
  infiniteRangeSelected,
}: Props) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { simulatedPriceCoefficients, tokenSymbols, currentTokenPricesUsd, priceRatioOrder } = useAllSimulatorData()

  // get simulated token price
  const simulatedTokenPricesUsd = multiplyArraysElementWise(currentTokenPricesUsd, simulatedPriceCoefficients)

  // get capital efficiency coeff
  const capitalEfficiencyCoefficient = infiniteRangeSelected ? 1 : getCapitalEfficiencyCoefficient(priceMin, priceMax)
  // check is infinite range is selected. If not, compute capital efficiency coeff. and increase virtual investment
  // get simulated stats based on if infinite range is selected
  const simulationStats = getSimulatedStatsForRange(
    currentTokenPricesUsd,
    simulatedTokenPricesUsd,
    infiniteRangeSelected ? 0 : priceMin,
    infiniteRangeSelected ? Infinity : priceMax,
    // investmentUsd,
    infiniteRangeSelected
      ? investmentUsd
      : investmentUsd * getInvestmentIncreaseCoefficient(currentTokenPricesUsd, priceMin, priceMax)
  )

  const { realTokenReservesCurrentPrice, realTokenReservesSimulatedPrice, ilAbsolute, ilRelative } = simulationStats

  const tokenBalancesDiff = subtractArraysElementWise(realTokenReservesSimulatedPrice, realTokenReservesCurrentPrice)
  // position value for current and simulated prices
  const positionValueCurrentPrices = getTokenArrayValue(realTokenReservesCurrentPrice, currentTokenPricesUsd)
  const positionValueSimulatedPrices = getTokenArrayValue(realTokenReservesSimulatedPrice, simulatedTokenPricesUsd)

  // TODO this shows different values when I switch price ratio order
  // maybe it's right, but is confusing
  // TODO show somewhere in the interface current token0/token1 price ratio so it's obvious.
  const getPositionStatus = (currentPrice: number, priceMin: number, priceMax: number) => {
    if (currentPrice < priceMin) {
      return (
        <PositionStatus>
          <InlineCircle color={theme.red1} size={22} marginRight={8} />
          Position is not gaining fees (price is below price range)
        </PositionStatus>
      )
    }
    if (currentPrice > priceMax) {
      return (
        <PositionStatus>
          <InlineCircle color={theme.red1} size={22} marginRight={8} />
          Position is not gaining fees (price is above price range)
        </PositionStatus>
      )
    }
    return (
      <PositionStatus>
        <InlineCircle color={theme.green1} size={22} marginRight={8} />
        Position is gaining fees
      </PositionStatus>
    )
  }

  return (
    <Wrapper>
      <GridWrapper>
        <GridRow
          firstColumn=""
          secondColumn="Today"
          thirdColumn={<RightPaddingWrapper>Simulated</RightPaddingWrapper>}
          fourthColumn="Difference"
          columnColors={['light', 'light', 'light', 'light']}
          columnAlignment={['left', 'right', 'right', 'left']}
        />
        <GridRow
          columnAlignment={['left', 'right', 'right', 'left']}
          firstColumn="Position assets"
          secondColumn={
            <PoolValueCryptoFiatWrapper>
              {formatDollarAmount(positionValueCurrentPrices)}
              <VerticalCryptoAmounts
                reversedOrder={priceRatioOrder === 'reversed'}
                maxWidth={70}
                tokenSymbols={tokenSymbols}
                tokenAmounts={realTokenReservesCurrentPrice}
              />
            </PoolValueCryptoFiatWrapper>
          }
          // simulation values
          thirdColumn={
            <PoolValueCryptoFiatWrapperBorder>
              {formatDollarAmount(positionValueSimulatedPrices)}
              <VerticalCryptoAmounts
                reversedOrder={priceRatioOrder === 'reversed'}
                maxWidth={70}
                tokenSymbols={tokenSymbols}
                tokenAmounts={realTokenReservesSimulatedPrice}
              />
            </PoolValueCryptoFiatWrapperBorder>
          }
          // difference values
          fourthColumn={
            <PoolValueCryptoFiatWrapper>
              <FiatDifference sign={getNumberSign(positionValueSimulatedPrices - positionValueCurrentPrices)}>
                {formatDollarAmount(positionValueSimulatedPrices - positionValueCurrentPrices, 2, true, true)}
              </FiatDifference>
              <VerticalCryptoAmounts
                reversedOrder={priceRatioOrder === 'reversed'}
                maxWidth={40}
                tokenSymbols={tokenSymbols}
                tokenAmounts={tokenBalancesDiff}
                textAlign="left"
                usePlusSymbol
              />
            </PoolValueCryptoFiatWrapper>
          }
        />
      </GridWrapper>
      <AdditionalInfoWrapper>
        <AddRow>
          {/* TODO add tooltip that it's compared to Uniswap v2 */}
          <AddTitle>Capital efficiency coefficient</AddTitle>
          <div>{capitalEfficiencyCoefficient.toFixed(2)}</div>
        </AddRow>
        {/* <AddRow>
          <AddTitle>Simulated price</AddTitle>
          <div>{roundToNDecimals(simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1], 5)}</div>
        </AddRow> */}
        <AddRow>
          <AddTitle>Impermanent loss:</AddTitle>
          <IlValuesWrapper>
            <IlRelative>
              {!ilAbsolute ? '0%' : formatPercentageValue(Math.abs(ilRelative) < 0.00001 ? 0 : ilRelative)}
            </IlRelative>
            <IlAbsolute>
              {ilAbsolute > 0 ? '-' : ''}
              {formatDollarAmount(ilAbsolute)}
            </IlAbsolute>
          </IlValuesWrapper>
        </AddRow>
        <AddRow>
          {getPositionStatus(
            simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1],
            infiniteRangeSelected ? 0 : priceMin,
            infiniteRangeSelected ? Infinity : priceMax
          )}
        </AddRow>
      </AdditionalInfoWrapper>
      <RemovePositionWrapper>
        <ButtonOutlined
          onClick={() => {
            dispatch(removePosition({ positionIndex }))
          }}
        >
          Remove Position
        </ButtonOutlined>
      </RemovePositionWrapper>
    </Wrapper>
  )
}
