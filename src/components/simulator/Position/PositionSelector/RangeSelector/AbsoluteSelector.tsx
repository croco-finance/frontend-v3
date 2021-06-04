import RangeSelector from 'components/RangeSelector'
import Input from 'components/Input'
import { useAllSimulatorData } from 'state/simulator/hooks'
import React, { useState } from 'react'
import styled from 'styled-components'
import { toTwoNonZeroDecimals, roundToNDecimals } from 'utils/numbers'
import { Position } from 'state/simulator/reducer'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  // margin-bottom: 10px;
`

const InputWrapper = styled.div`
  width: 110px;
  margin: 0 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 26px;
`

const InputLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 6px;
  font-size: ${({ theme }) => theme.fontSize.small};
`

const SliderWrapper = styled.div`
  margin-left: 20px;
  margin-right: 20px;
`

interface Props {
  positionIndex: number
  onPriceLimitChange: (value: number, limit: 'min' | 'max') => void
  disabled: boolean
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
}

// eslint-disable-next-line no-empty-pattern
export default function PriceRangeSelector({
  onPriceLimitChange,
  disabled,
  priceMin,
  priceMax,
}: // positionIndex,
// investmentUsd,

// infiniteRangeSelected,
Props) {
  // const dispatch = useDispatch();
  const { currentTokenPricesUsd } = useAllSimulatorData()
  const [sliderValues, setSliderValues] = useState([priceMin, priceMax])

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  // TODO there is some bug. The input values do not change when I change the priceRatioOrder
  const [sliderMinPrice, setSliderMinPrice] = useState(priceMin)
  const [sliderMaxPrice, setSliderMaxPrice] = useState(priceMax)

  const handleSliderLimitPriceChange = (value: string, price: 'min' | 'max') => {
    const typedValueFloat = parseFloat(value)
    if (price === 'min') {
      setSliderMinPrice(typedValueFloat)
      setSliderValues([typedValueFloat, sliderValues[1]])
      // call function that saves changes to redux
      if (typedValueFloat) {
        onPriceLimitChange(typedValueFloat, price)
      }
    }
    if (price === 'max') {
      setSliderMaxPrice(typedValueFloat)
      setSliderValues([sliderValues[0], typedValueFloat])
      // call function that saves changes to redux && make sure you don't save 0 as max price (avoid division error)
      if (typedValueFloat && typedValueFloat > 0) {
        onPriceLimitChange(typedValueFloat, price)
      }
    }
  }

  const handleSliderMoveChange = (newValue: number[]) => {
    setSliderValues(newValue)
    // call function that saves changes to redux
    onPriceLimitChange(newValue[0], 'min')
    // make sure max price is not zero so you don't come across divison error
    if (newValue[1] > 0) {
      onPriceLimitChange(newValue[1], 'max')
    }
  }
  // todo check if current price is out of range selector range and set the mark value properly so it does not
  // appear out of the range viewbox
  const getSliderMarkValue = (currentPrice: number, sliderMinPrice: number, sliderMaxPrice: number) => {
    if (currentPrice < sliderMinPrice) {
      return sliderMinPrice
    }

    if (currentPrice > sliderMaxPrice) {
      return sliderMaxPrice
    }

    return currentPrice
  }

  const marks = [
    {
      value: getSliderMarkValue(currentPriceRatio, sliderMinPrice, sliderMaxPrice),
      label: '',
    },
  ]

  return (
    <Wrapper>
      <InputWrapper>
        <InputLabel>Min</InputLabel>
        <Input
          disabled={disabled}
          value={sliderValues[0].toString()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            handleSliderLimitPriceChange(event.target.value.trim(), 'min')
          }}
          useWhiteBackground
          variant="small"
          type="number"
        />
      </InputWrapper>

      <SliderWrapper>
        <RangeSelector
          disabled={disabled}
          min={sliderMinPrice}
          max={sliderMaxPrice}
          // TODO compute step based on the amount of decimal of currentPriceRatio
          step={0.0001}
          width={240}
          marks={marks}
          value={sliderValues}
          onChange={(_: any, newValue: number[]) => handleSliderMoveChange(newValue)}
        />
      </SliderWrapper>
      <InputWrapper>
        <InputLabel>Max</InputLabel>
        <Input
          disabled={disabled}
          value={sliderValues[1].toString()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            handleSliderLimitPriceChange(event.target.value.trim(), 'max')
          }}
          useWhiteBackground
          variant="small"
          type="number"
        />
      </InputWrapper>
    </Wrapper>
  )
}
