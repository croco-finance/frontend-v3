import Checkbox from 'components/Checkbox'
import Input from 'components/Input'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPositionInvestedAmount, toggleInfiniteRange } from 'state/simulator/actions'
import { Position } from 'state/simulator/reducer'
import styled from 'styled-components'
import { AppDispatch } from '../../../../state'
import RangeSelector from './RangeSelector'
import RangeTypeSelect, { RangeTypes } from './RangeTypeSelect'
import { useAllSimulatorData } from 'state/simulator/hooks'
import AbsoluteSelector from './RangeSelector/AbsoluteSelector'
import RelativeSelector from './RangeSelector/RelativeSelector'
import { setPositionMinPrice, setPositionMaxPrice } from 'state/simulator/actions'
import { roundToNDecimals } from 'utils/numbers'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text3};
`

const Headline = styled.div`
  color: ${({ theme }) => theme.text3};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin-bottom: 20px;
`

const RangeInputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const RangeTypeSelectWrapper = styled.div`
  margin-top: 50px;
`

const RangeSelectorWrapper = styled.div`
  height: 120px;
  display: flex;
  align-items: center;
`

const InfiniteRangeWrapper = styled.div`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.text3};
`

const InvestmentWrapper = styled.div`
  display: flex;
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

const CurrentPriceLabel = styled.div`
  width: 100%;
  text-align: center;
`

interface Props {
  positionIndex: number
  investmentUsd: Position['investmentUsd']
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
  infiniteRangeSelected: Position['infiniteRangeSelected']
}

export default function PositionSelector({ positionIndex, investmentUsd, infiniteRangeSelected }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const [rangeSelectorType, setRangeSelectorType] = useState<RangeTypes>('relative')
  const { priceRatioOrder, tokenSymbols, currentTokenPricesUsd } = useAllSimulatorData()
  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  const handleInvestmentChange = (inputValue: string) => {
    const inputValueFloat = parseFloat(inputValue)
    dispatch(setPositionInvestedAmount({ value: inputValueFloat, positionIndex }))
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
            key="RelativeSelector0"
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
          />
        )
      } else {
        return (
          <RelativeSelector
            key="RelativeSelector1"
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
          />
        )
      }
    } else {
      if (priceOrder === 'default') {
        return (
          <AbsoluteSelector
            key="AbsoluteSelector0"
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
          />
        )
      } else {
        return (
          <AbsoluteSelector
            key="AbsoluteSelector1"
            disabled={disabled}
            positionIndex={positionIndex}
            onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
          />
        )
      }
    }
  }

  return (
    <Wrapper>
      <Headline>Specify price range and invested amount</Headline>
      <RangeInputsWrapper>
        <InfiniteRangeWrapper>
          <Checkbox
            isChecked={infiniteRangeSelected}
            onClick={() => {
              dispatch(toggleInfiniteRange({ positionIndex }))
            }}
          >
            Infinite range (Uniswap v2 approach)
          </Checkbox>
        </InfiniteRangeWrapper>

        {getPriceRangeSelector(rangeSelectorType, priceRatioOrder, infiniteRangeSelected)}
        {/* <RangeSelectorWrapper>
          <RangeSelector type={rangeSelectorType} positionIndex={positionIndex} disabled={infiniteRangeSelected} />
        </RangeSelectorWrapper> */}

        <CurrentPriceLabel>{`Current: 1 ${tokenSymbols[0]} = ${roundToNDecimals(currentPriceRatio, 5)} ${
          tokenSymbols[1]
        } `}</CurrentPriceLabel>

        <RangeTypeSelectWrapper>
          <RangeTypeSelect
            typeSelected={rangeSelectorType}
            onTypeChange={(type) => {
              setRangeSelectorType(type)
            }}
          />
        </RangeTypeSelectWrapper>
      </RangeInputsWrapper>

      <InvestmentWrapper>
        <InvestmentTitle>Your investment in this position:</InvestmentTitle>
        <InvestmentInputWrapper>
          {/* TODO display in formatted fiat format */}
          <Input
            value={investmentUsd.toString()}
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
