import Input from 'components/Input'
import RangeSelector from 'components/RangeSelector'
import React, { useEffect, useState } from 'react'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { Position } from 'state/simulator/reducer'
import styled from 'styled-components'
import { formatNumber } from 'utils/numbers'

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
  width: 124px;
  margin: 0 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 26px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: row;
  margin: 10px 0;
  padding: 0;
  `};
`

const InputLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 6px;
  font-size: ${({ theme }) => theme.fontSize.small};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-bottom: 0;
  margin-right: 10px;
  `};
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
export default function PriceRangeSelector({ onPriceLimitChange, disabled, priceMin, priceMax }: Props) {
  // const dispatch = useDispatch();
  const { currentTokenPricesUsd } = useAllSimulatorData()
  const [sliderValues, setSliderValues] = useState([
    formatNumber(priceMin).toString(),
    formatNumber(priceMax).toString(),
  ])

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  // TODO there is some bug. The input values do not change when I change the priceRatioOrder
  const [sliderMinPrice, setSliderMinPrice] = useState(formatNumber(priceMin).toString())
  const [sliderMaxPrice, setSliderMaxPrice] = useState(formatNumber(priceMax).toString())

  const handleSliderLimitPriceChange = (value: string, price: 'min' | 'max') => {
    const typedValueFloat = parseFloat(value)
    if (price === 'min') {
      setSliderMinPrice(value)
      setSliderValues([value, sliderValues[1]])
      // call function that saves changes to redux
      if (typedValueFloat && typedValueFloat < parseFloat(sliderValues[1])) {
        onPriceLimitChange(typedValueFloat, price)
      }
    }
    if (price === 'max') {
      setSliderMaxPrice(value)
      setSliderValues([sliderValues[0], value])
      // call function that saves changes to redux && make sure you don't save 0 as max price (avoid division error)
      if (typedValueFloat && typedValueFloat > 0 && parseFloat(sliderValues[0]) < typedValueFloat) {
        onPriceLimitChange(typedValueFloat, price)
      }
    }
  }

  const handleSliderMoveChange = (newValue: number[]) => {
    setSliderValues([newValue[0].toString(), newValue[1].toString()])
    // call function that saves changes to redux
    if (newValue[0] < newValue[1] && newValue[1] > priceMin && newValue[0] < priceMax) {
      onPriceLimitChange(newValue[0], 'min')
      // make sure max price is not zero so you don't come across divison error
      if (newValue[1] > 0) {
        onPriceLimitChange(newValue[1], 'max')
      }
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
      value: getSliderMarkValue(currentPriceRatio, parseFloat(sliderMinPrice), parseFloat(sliderMaxPrice)),
      label: '',
    },
  ]

  useEffect(() => {
    onPriceLimitChange(parseFloat(formatNumber(priceMin)), 'min')
    onPriceLimitChange(parseFloat(formatNumber(priceMax)), 'max')
  }, [])

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
          min={parseFloat(sliderMinPrice)}
          max={parseFloat(sliderMaxPrice)}
          step={(parseFloat(sliderMaxPrice) - parseFloat(sliderMinPrice)) / 100}
          width={220}
          marks={marks}
          value={[parseFloat(sliderValues[0]), parseFloat(sliderValues[1])]}
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
