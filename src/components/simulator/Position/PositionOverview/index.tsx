import { ButtonOutlined } from 'components/Button'
import VerticalCryptoAmounts from 'components/VerticalCryptoAmounts'
import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { removePosition } from 'state/simulator/actions'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { Position } from 'state/simulator/reducer'
import styled, { css } from 'styled-components'
import { getTokenArrayValue, multiplyArraysElementWise, subtractArraysElementWise } from 'utils/math'
import { formatDollarAmount, formatPercentageValue, getNumberSign } from 'utils/numbers'
import {
  getCapitalEfficiencyCoefficient,
  getInvestmentIncreaseCoefficient,
  getSimulatedStatsForRange,
} from 'utils/simulator'
import GridRow from './GridRow'
import { estimate24hUsdFees } from 'data/simulator/feeEstimation'
import Loader from 'components/Loader'
import { priceToClosestTick } from '@uniswap/v3-sdk'
import { Price, Token } from '@uniswap/sdk-core'
import { MouseoverTooltip } from 'components/Tooltip'
import Icon from 'components/Icon'
import useTheme from 'hooks/useTheme'

const Wrapper = styled.div`
  display: flex;
  flex-direction column;
  color: ${({ theme }) => theme.text1};
  width: 100%;
`

const GridWrapper = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(100px, auto) minmax(110px, auto) minmax(120px, auto) 125px;
  grid-template-rows: 28px auto;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  align-items: center;
  /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
  overflow-x: auto;
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
  border-right: 1px solid ${({ theme }) => theme.text4};
  padding-right: 10px;
`

const AdditionalInfoWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  margin-top: 40px;
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
  align-items: center;
  flex-grow: 1;
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
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

const gcd = (a: number, b: number): any => {
  if (!b) {
    return a
  }

  return gcd(b, a % b)
}

const getNumeratorAndDenominatorOfFraction = (fraction: number) => {
  const len = fraction.toString().length - 2

  let denominator = Math.pow(10, len)
  let numerator = fraction * denominator

  const divisor = gcd(numerator, denominator)

  numerator /= divisor
  denominator /= divisor

  return { numerator, denominator }
}

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
  const dispatch = useDispatch()
  const {
    simulatedPriceCoefficients,
    tokenSymbols,
    currentTokenPricesUsd,
    priceRatioOrder,
    poolId,
    tokenBase,
    tokenQuote,
  } = useAllSimulatorData()
  const [feeEstimate, setFeeEstimate] = useState<number | null>(0)
  const lastPriceUpdate = useRef<number>(Date.now())

  const theme = useTheme()
  // useEffect to set fees
  useEffect(() => {
    async function getFeeEstimate() {
      setFeeEstimate(null)

      if (tokenBase && tokenQuote) {
        const token0 = new Token(1, tokenBase.address, tokenBase.decimals, tokenBase.symbol, tokenBase.name)
        const token1 = new Token(1, tokenQuote.address, tokenQuote.decimals, tokenQuote.symbol, tokenQuote.name)

        const { numerator: numeratorMin, denominator: denominatorMin } = getNumeratorAndDenominatorOfFraction(
          priceRatioOrder === 'default' ? 1 / priceMin : priceMin
        )
        const { numerator: numeratorMax, denominator: denominatorMax } = getNumeratorAndDenominatorOfFraction(
          priceRatioOrder === 'default' ? 1 / priceMax : priceMax
        )

        let priceLower
        let priceUpper
        const decimalsDifference = tokenBase.decimals - tokenQuote.decimals

        if (decimalsDifference < 0) {
          priceLower = new Price(token0, token1, numeratorMin, denominatorMin * 10 ** -decimalsDifference)
          priceUpper = new Price(token0, token1, numeratorMax, denominatorMax * 10 ** -decimalsDifference)
        } else {
          priceLower = new Price(token0, token1, numeratorMin * 10 ** decimalsDifference, denominatorMin)
          priceUpper = new Price(token0, token1, numeratorMax * 10 ** decimalsDifference, denominatorMax)
        }

        let tickLower = priceToClosestTick(priceLower) || undefined
        let tickUpper = priceToClosestTick(priceUpper) || undefined

        // switch tick order of lower is bigger than upper
        if (tickLower && tickUpper) {
          if (tickLower > tickUpper) {
            const tmp = tickUpper
            tickUpper = tickLower
            tickLower = tmp
          }

          const feesUsd = await estimate24hUsdFees(poolId, investmentUsd, tickLower, tickUpper, 7)
          setFeeEstimate(feesUsd)
        }
      }
    }

    // save time of last priceMin / priceMax change
    lastPriceUpdate.current = Date.now()

    // try to fetch fees only when there is some time between parameters changes
    if (investmentUsd > 0) {
      setTimeout(() => {
        if (Date.now() - lastPriceUpdate.current > 250) {
          getFeeEstimate()
        }
      }, 300)
    } else {
      setFeeEstimate(0)
    }
  }, [priceMin, priceMax, investmentUsd, poolId, tokenBase, tokenQuote, priceRatioOrder])

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
          <AddTitle>
            <MouseoverTooltip text={`Daily average of last week's fee rewards in selected price range`}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Daily fees estimate:
                <Icon icon="QUESTION_ACTIVE" size={18} color={theme.text3} style={{ marginLeft: '2px' }} />
              </div>
            </MouseoverTooltip>
          </AddTitle>

          <div>{feeEstimate === 0 ? '0' : feeEstimate ? formatDollarAmount(feeEstimate) : <Loader />}</div>
        </AddRow>
        <AddRow>
          {/* TODO add tooltip that it's compared to Uniswap v2 */}
          <AddTitle style={{ color: theme.text3 }}>Capital efficiency coefficient</AddTitle>
          <div style={{ color: theme.text3 }}>{capitalEfficiencyCoefficient.toFixed(2)}</div>
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
