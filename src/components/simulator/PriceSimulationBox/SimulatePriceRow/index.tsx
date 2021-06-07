import CurrencyLogo from 'components/CurrencyLogo'
import { formatDollarAmount } from 'utils/numbers'
import Slider from 'components/Slider'
import Input from 'components/Input'
import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  height: 66px;
`

const TokenNameWrapper = styled.div`
  display: flex;
  width: 100px;
  color: ${({ theme }) => theme.text1};
`

const TokenSymbol = styled.div`
  text-transform: uppercase;
  margin-left: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 90px;
  margin-right: 20px;
`

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-self: flex-start;
`

const SliderLabel = styled.div`
  color: ${({ theme }) => theme.text3};
`

const SliderLeftLabel = styled(SliderLabel)`
  padding-right: 10px;
`

const SliderRightLabel = styled(SliderLabel)`
  padding-left: 12px;
`

const SimulatedPrice = styled.div`
  text-align: right;
  flex-grow: 1;
  color: ${({ theme }) => theme.text1};
`

interface Props {
  onSliderMoveChange: (value: number) => void
  onNewDefaultSliderValue: (value: number) => void
  tokenAddress: string
  tokenSymbol: string
  simulatedPrice: number
  defaultSliderValue?: number
  numSteps?: number
}

const SimulatePriceRow = ({
  tokenAddress,
  tokenSymbol,
  simulatedPrice,
  onSliderMoveChange,
  onNewDefaultSliderValue,
  defaultSliderValue = 1,
  numSteps = 100,
}: Props) => {
  const theme = useTheme()
  const [sliderMidValue, setSliderMidValue] = useState(defaultSliderValue.toString())
  const [sliderValue, setSliderValue] = useState(defaultSliderValue.toString())

  const handleSliderMoveChange = (newValue: string) => {
    setSliderValue(newValue)
    onSliderMoveChange(parseFloat(newValue))
  }

  const handleInputChange = (value: string) => {
    const typedValueFloat = parseFloat(value)
    setSliderValue(value)
    if (typedValueFloat) {
      handleSliderMoveChange(value)
      setSliderMidValue(value)
      onNewDefaultSliderValue(typedValueFloat)
    }
  }

  return (
    <Wrapper>
      <TokenNameWrapper>
        <CurrencyLogo address={tokenAddress} size={'22px'} />
        <TokenSymbol>{tokenSymbol}</TokenSymbol>
      </TokenNameWrapper>
      <InputWrapper>
        <Input
          useWhiteBackground
          variant="small"
          type="number"
          value={sliderValue.toString()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            handleInputChange(event.target.value)
          }}
        />
        <div
          style={{
            color: theme.text3,
            marginLeft: '6px',
          }}
        >
          x
        </div>
      </InputWrapper>
      <SliderWrapper>
        <SliderLeftLabel>0</SliderLeftLabel>
        <Slider
          min={0}
          max={parseFloat(sliderMidValue) * 2}
          step={parseFloat(sliderMidValue) / numSteps}
          value={parseFloat(sliderValue)}
          onChange={(_: any, newValue: number) => handleSliderMoveChange(newValue.toString())}
        />
        <SliderRightLabel>
          {parseFloat(sliderMidValue) * 2 ? `${parseFloat(sliderMidValue) * 2}x` : ''}
        </SliderRightLabel>
      </SliderWrapper>
      <SimulatedPrice>{formatDollarAmount(simulatedPrice)}</SimulatedPrice>
    </Wrapper>
  )
}

export default SimulatePriceRow
