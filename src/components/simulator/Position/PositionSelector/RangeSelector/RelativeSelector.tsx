import Input from 'components/Input'
import RangeSelector from 'components/RangeSelector'
import React, { useEffect, useState } from 'react'
import { useAllSimulatorData } from 'state/simulator/hooks'
import styled from 'styled-components'
import { toTwoNonZeroDecimals } from 'utils/numbers'
import { Position } from 'state/simulator/reducer'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  `};
`

const InputWrapper = styled.div`
  width: 110px;
  margin: 0 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: row;
  width: 200px;
  margin: 10px 0;
  padding: 0;
  `};
`

const InputWrapper2 = styled.div`
  display: flex;
  align-items: center;
`

const PercentageLabel = styled.div`
  margin-left: 6px;
`

const AbsValueWrapper = styled.div`
  margin-top: 6px;
  padding-right: 16px;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.text3};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-top: 0;
  margin-left: 20px
  `};
`

const InputLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 6px;
  padding-right: 16px;
  font-size: ${({ theme }) => theme.fontSize.small};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-bottom: 0;
  padding-right: 10px;
  `};
`

const SliderWrapper = styled.div`
  margin-left: 20px;
  margin-right: 20px;
`

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  initialMinRatio?: number
  initialMaxRatio?: number
  positionIndex: number
  onPriceLimitChange: (value: number, limit: 'min' | 'max') => void
  disabled: boolean
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
}

// eslint-disable-next-line no-empty-pattern
export default function RelativeRangeSelector({
  initialMinRatio = -50,
  initialMaxRatio = 50,
  onPriceLimitChange,
  disabled,
  priceMin,
  priceMax,
}: Props) {
  const { currentTokenPricesUsd } = useAllSimulatorData()
  const [sliderValues, setSliderValues] = useState([initialMinRatio.toString(), initialMaxRatio.toString()])

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  // TODO there is some bug. The input values do not change when I change the priceRatioOrder
  const [sliderMinPrice, setSliderMinPrice] = useState(initialMinRatio.toString())
  const [sliderMaxPrice, setSliderMaxPrice] = useState(initialMaxRatio.toString())

  const getAbsolutePriceRatio = (currentPriceRatio: number, percentageDifference: number) =>
    toTwoNonZeroDecimals(currentPriceRatio + (percentageDifference / 100) * currentPriceRatio)

  const handleSliderLimitPriceChange = (value: string, price: 'min' | 'max') => {
    const typedValueFloat = parseFloat(value)
    if (price === 'min') {
      setSliderMinPrice(value)
      setSliderValues([value, sliderValues[1]])
      if (typedValueFloat && typedValueFloat < parseFloat(sliderValues[1])) {
        onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, typedValueFloat), 'min')
      }
    }
    if (price === 'max') {
      setSliderMaxPrice(value)
      setSliderValues([sliderValues[0], value])
      if (typedValueFloat && parseFloat(sliderValues[0]) < typedValueFloat) {
        onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, typedValueFloat), 'max')
      }
    }
  }

  const handleSliderMoveChange = (newValue: number[]) => {
    setSliderValues([newValue[0].toString(), newValue[1].toString()])
    if (
      newValue[0] < newValue[1] &&
      getAbsolutePriceRatio(currentPriceRatio, newValue[1]) > priceMin &&
      getAbsolutePriceRatio(currentPriceRatio, newValue[0]) < priceMax
    ) {
      // call function that saves changes to redux
      // newValue is percentage difference which the user selected. Compute price from that and save that value to redux.
      if (newValue[0]) {
        onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, newValue[0]), 'min')
      }

      if (newValue[1] && newValue[0] < newValue[1]) {
        onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, newValue[1]), 'max')
      }
    }
  }

  // TODO if mark out of range, do not show
  const marks = [
    {
      value: 0,
      label: '',
    },
  ]

  useEffect(() => {
    onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, initialMinRatio), 'min')
    onPriceLimitChange(getAbsolutePriceRatio(currentPriceRatio, initialMaxRatio), 'max')
  }, [])

  return (
    <Wrapper>
      <InputWrapper>
        <InputLabel>Min</InputLabel>
        <InputWrapper2>
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
          <PercentageLabel>%</PercentageLabel>
        </InputWrapper2>
        <AbsValueWrapper>
          {sliderValues[0] ? getAbsolutePriceRatio(currentPriceRatio, parseFloat(sliderValues[0])) : '-'}
        </AbsValueWrapper>
      </InputWrapper>

      <SliderWrapper>
        <RangeSelector
          disabled={disabled}
          min={parseFloat(sliderMinPrice)}
          max={parseFloat(sliderMaxPrice)}
          step={0.01}
          width={220}
          marks={marks}
          value={[parseFloat(sliderValues[0]), parseFloat(sliderValues[1])]}
          onChange={(_: any, newValue: number[]) => handleSliderMoveChange(newValue)}
        />
      </SliderWrapper>
      <InputWrapper>
        <InputLabel>Max</InputLabel>
        <InputWrapper2>
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
          <PercentageLabel>%</PercentageLabel>
        </InputWrapper2>
        <AbsValueWrapper>
          {sliderValues[1] ? getAbsolutePriceRatio(currentPriceRatio, parseFloat(sliderValues[1])) : '-'}
        </AbsValueWrapper>
      </InputWrapper>
    </Wrapper>
  )
}
