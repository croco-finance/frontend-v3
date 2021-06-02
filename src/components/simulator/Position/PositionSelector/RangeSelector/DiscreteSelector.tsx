import { setPositionMaxPrice, setPositionMinPrice } from 'state/simulator/actions'
import Input from 'components/Input'
import React from 'react'
import { useDispatch } from 'react-redux'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { Position } from 'state/simulator/reducer'
import styled from 'styled-components'
import { formatAmount } from 'utils/numbers'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
`
const RangeInputsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`

const RowHeadline = styled.div`
  width: 70px;
  color: ${({ theme }) => theme.text2};
`

const InputDataWrapper = styled.div`
  display: flex;
  align-items: center;
`

const InputWrapper = styled.div`
  width: 110px;
  margin: 0 12px;
`

const AssetLeft = styled.div`
  width: 80px;
  text-align: right;
`

const AssetRight = styled.div``

const PriceRatiosWrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.text3};
`

const PriceRatio = styled.div`
  padding: 5px 0;
  display: flex;
`

interface Props {
  positionIndex: number
  priceMin: Position['priceMin']
  priceMax: Position['priceMax']
  infiniteRangeSelected: Position['infiniteRangeSelected']
}

export default function DiscreteSelecton({ positionIndex, priceMin, priceMax, infiniteRangeSelected }: Props) {
  const dispatch = useDispatch()
  const { tokenSymbols, currentTokenPricesUsd } = useAllSimulatorData()

  const handlePriceChange = (inputValue: string, priceType: 'min' | 'max') => {
    const inputValueFloat = parseFloat(inputValue)
    if (priceType === 'min') dispatch(setPositionMinPrice({ price: inputValueFloat, positionIndex }))
    if (priceType === 'max') dispatch(setPositionMaxPrice({ price: inputValueFloat, positionIndex }))
  }

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]

  return (
    <Wrapper>
      <RangeInputsWrapper>
        <InputRow>
          <RowHeadline>From:</RowHeadline>
          <InputDataWrapper>
            <AssetLeft>1 {tokenSymbols[0]} =</AssetLeft>
            <InputWrapper>
              <Input
                disabled={infiniteRangeSelected}
                value={priceMin.toString()}
                onChange={(event) => {
                  handlePriceChange(event.target.value.trim(), 'min')
                }}
                useWhiteBackground
                useDarkBorder
                variant="small"
                type="number"
              />
            </InputWrapper>
            <AssetRight>{tokenSymbols[1]}</AssetRight>
          </InputDataWrapper>
        </InputRow>

        {/* Make check that the upper price limit has to be higher than the bottom one */}
        <InputRow>
          <RowHeadline>To:</RowHeadline>
          <InputDataWrapper>
            <AssetLeft>1 {tokenSymbols[0]} =</AssetLeft>
            <InputWrapper>
              <Input
                disabled={infiniteRangeSelected}
                value={priceMax.toString()}
                onChange={(event) => {
                  handlePriceChange(event.target.value.trim(), 'max')
                }}
                useWhiteBackground
                useDarkBorder
                variant="small"
                type="number"
              />
            </InputWrapper>

            <AssetRight>{tokenSymbols[1]}</AssetRight>
          </InputDataWrapper>
        </InputRow>
        <PriceRatiosWrapper>
          <PriceRatio>
            {`Current price: 1 ${tokenSymbols[0]} = ${formatAmount(currentPriceRatio)} ${tokenSymbols[1]}`}
          </PriceRatio>
        </PriceRatiosWrapper>
      </RangeInputsWrapper>
    </Wrapper>
  )
}
