import React from 'react'
import { useDispatch } from 'react-redux'
import { switchPriceRatioOrder } from 'state/simulator/actions'
import { useAllSimulatorData } from 'state/simulator/hooks'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const SwitchPriceLabel = styled.div`
  margin-right: 20px;
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: ${({ theme }) => theme.fontSize.small}
  margin-right: 5px;
  `}
`
const SwitchPriceButton = styled.button<{ selected: boolean }>`
  padding: 6px 8px;
  border-radius: 5px;
  margin: 0 4px;
  border: none;
  background: ${(props) => (props.selected ? props.theme.primary1 : 'inherit')};
  cursor: pointer;
  color: ${(props) => (props.selected ? props.theme.white : props.theme.text3)};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 6px;
  font-size: ${({ theme }) => theme.fontSize.tiny}
  `}
`

const PriceReferenceSwitch = () => {
  const dispatch = useDispatch()
  const { tokenSymbols, priceRatioOrder } = useAllSimulatorData()

  return (
    <Wrapper>
      <SwitchPriceLabel>Price reference:</SwitchPriceLabel>
      <SwitchPriceButton
        selected={priceRatioOrder === 'default'}
        // don't allow to click on it when selected
        disabled={priceRatioOrder === 'default'}
        onClick={() => {
          dispatch(switchPriceRatioOrder())
        }}
      >
        {priceRatioOrder === 'default'
          ? `${tokenSymbols[0]} / ${tokenSymbols[1]}`
          : `${tokenSymbols[1]} / ${tokenSymbols[0]}`}
      </SwitchPriceButton>
      <SwitchPriceButton
        selected={priceRatioOrder === 'reversed'}
        disabled={priceRatioOrder === 'reversed'}
        onClick={() => {
          dispatch(switchPriceRatioOrder())
        }}
      >
        {priceRatioOrder === 'default'
          ? `${tokenSymbols[1]} / ${tokenSymbols[0]}`
          : `${tokenSymbols[0]} / ${tokenSymbols[1]}`}
      </SwitchPriceButton>
    </Wrapper>
  )
}

export default PriceReferenceSwitch
