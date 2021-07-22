import Checkbox from 'components/Checkbox'
import Input from 'components/Input'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  setPositionInvestedAmount,
  setPositionMaxPrice,
  setPositionMinPrice,
  toggleInfiniteRange,
} from 'state/simulator/actions'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { Position } from 'state/simulator/reducer'
import styled from 'styled-components'
import { multiplyArraysElementWise } from 'utils/math'
import { formatNumber } from 'utils/numbers'
import { AppDispatch } from '../../../../state'
import AbsoluteSelector from './RangeSelector/AbsoluteSelector'
import RelativeSelector from './RangeSelector/RelativeSelector'
import RangeTypeSelect, { RangeTypes } from './RangeTypeSelect'
import useTheme from 'hooks/useTheme'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text3};
`

const Headline = styled.div`
  display: flex;
  color: ${({ theme }) => theme.text3};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
`

const RangeInputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const RangeTypeSelectWrapper = styled.div`
  margin-left: 10px;
`

const InfiniteRangeWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
  margin-top: 28px;
  color: ${({ theme }) => theme.text3};
  font-size: ${({ theme }) => theme.fontSize.small};
`

const InvestmentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
`

const InvestmentTitle = styled.div`
  margin-right: 20px;
`

const InvestmentInputWrapper = styled.div`
  width: 120px;
  margin-right: 10px;
`
const PriceLabelsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-top: 28px;
  `};
`
const PriceLabel = styled.div`
  display: flex;
  margin: 4px 0;
`

const PriceLabelTitle = styled.div`
  width: 90px;
  display: flex;
`

interface Props {
  positionIndex: number
  investmentUsd: Position['investmentUsd']
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
  infiniteRangeSelected: Position['infiniteRangeSelected']
}

export default function PositionSelector({
  positionIndex,
  investmentUsd,
  infiniteRangeSelected,
  priceMin,
  priceMax,
}: Props) {
  const theme = useTheme()
  const dispatch = useDispatch<AppDispatch>()
  const [rangeSelectorType, setRangeSelectorType] = useState<RangeTypes>('absolute')
  const [investedAmountState, setInvestedAmountState] = useState(investmentUsd.toString())
  const {
    priceRatioOrder,
    tokenSymbols,
    currentTokenPricesUsd,
    simulatedPriceCoefficients,
    poolId,
  } = useAllSimulatorData()
  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  // get simulated token price
  const simulatedTokenPricesUsd = multiplyArraysElementWise(currentTokenPricesUsd, simulatedPriceCoefficients)
  const simulatedPriceRatio = simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1]

  const handleInvestmentChange = (inputValue: string) => {
    // change the value in the input
    setInvestedAmountState(inputValue)
    const inputValueFloat = parseFloat(inputValue)
    // if the input value is valid number, propagate the change to simulator reducer state
    if (inputValueFloat && inputValueFloat > 0) {
      dispatch(setPositionInvestedAmount({ value: inputValueFloat, positionIndex }))
    } else {
      dispatch(setPositionInvestedAmount({ value: 0, positionIndex }))
    }
  }

  const handlePriceLimitChange = (price: number, priceLimit: 'min' | 'max') => {
    if (priceLimit === 'min') dispatch(setPositionMinPrice({ price, positionIndex }))
    if (priceLimit === 'max') dispatch(setPositionMaxPrice({ price, positionIndex }))
  }

  const getPriceRangeSelector = (selectorType: RangeTypes, priceOrder: string, disabled: boolean) => {
    if (selectorType === 'relative') {
      if (priceOrder === 'default') {
        return (
          <RelativeSelector
            key={`${poolId}_RelativeSelector0`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
            priceMin={priceMin}
            priceMax={priceMax}
          />
        )
      } else {
        return (
          <RelativeSelector
            key={`${poolId}_RelativeSelector1`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
            priceMin={priceMin}
            priceMax={priceMax}
          />
        )
      }
    } else {
      if (priceOrder === 'default') {
        return (
          <AbsoluteSelector
            key={`${poolId}_AbsoluteSelector0`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
            priceMin={priceMin}
            priceMax={priceMax}
          />
        )
      } else {
        return (
          <AbsoluteSelector
            key={`${poolId}_AbsoluteSelector1`}
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
            priceMin={priceMin}
            priceMax={priceMax}
          />
        )
      }
    }
  }

  return (
    <Wrapper>
      <Headline>
        Specify price range:
        <RangeTypeSelectWrapper>
          <RangeTypeSelect
            typeSelected={rangeSelectorType}
            onTypeChange={(type) => {
              setRangeSelectorType(type)
            }}
          />
        </RangeTypeSelectWrapper>
      </Headline>
      <RangeInputsWrapper>
        {getPriceRangeSelector(rangeSelectorType, priceRatioOrder, infiniteRangeSelected)}
        {/* <RangeSelectorWrapper>
          <RangeSelector type={rangeSelectorType} positionIndex={positionIndex} disabled={infiniteRangeSelected} />
        </RangeSelectorWrapper> */}

        <PriceLabelsWrapper>
          <PriceLabel>
            <PriceLabelTitle style={{ color: theme.pink1 }}>Current:</PriceLabelTitle>
            {`1 ${tokenSymbols[0]} = ${formatNumber(currentPriceRatio)} ${tokenSymbols[1]} `}
          </PriceLabel>
          <PriceLabel>
            <PriceLabelTitle>Simulated:</PriceLabelTitle>
            {`1 ${tokenSymbols[0]} = ${formatNumber(simulatedPriceRatio)} ${tokenSymbols[1]} `}
          </PriceLabel>
        </PriceLabelsWrapper>

        <InfiniteRangeWrapper>
          <Checkbox
            isChecked={infiniteRangeSelected}
            onClick={() => {
              dispatch(toggleInfiniteRange({ positionIndex }))
            }}
          >
            Infinite range (as Uniswap v2)
          </Checkbox>
        </InfiniteRangeWrapper>
      </RangeInputsWrapper>

      <InvestmentWrapper>
        <InvestmentTitle>Investment in this position:</InvestmentTitle>
        <InvestmentInputWrapper>
          {/* TODO display in formatted fiat format */}
          <Input
            value={investedAmountState}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleInvestmentChange(event.target.value.trim())
            }}
            useWhiteBackground
            variant="small"
            type="number"
          />
        </InvestmentInputWrapper>
        USD
      </InvestmentWrapper>
    </Wrapper>
  )
}
