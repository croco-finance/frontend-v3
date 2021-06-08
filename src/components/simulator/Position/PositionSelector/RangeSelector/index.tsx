import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import AbsoluteSelector from './AbsoluteSelector'
import RelativeSelector from './RelativeSelector'
import { setPositionMinPrice, setPositionMaxPrice } from 'state/simulator/actions'
import { RangeTypes } from '../RangeTypeSelect'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
`

interface Props {
  type: RangeTypes
  positionIndex: number
  disabled: boolean
}

// eslint-disable-next-line no-empty-pattern
export default function PriceRangeSelector({ type = 'absolute', positionIndex, disabled }: Props) {
  const dispatch = useDispatch()

  const handlePriceLimitChange = (price: number, priceLimit: 'min' | 'max') => {
    if (priceLimit === 'min') dispatch(setPositionMinPrice({ price, positionIndex }))
    if (priceLimit === 'max') dispatch(setPositionMaxPrice({ price, positionIndex }))
  }

  return (
    <Wrapper>
      {/* TODO add second selector of the same type for reversed order */}
      {type === 'absolute' && (
        // <AbsoluteSelector
        //   disabled={disabled}
        //   positionIndex={positionIndex}
        //   onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
        // />
        <div></div>
      )}
      {type === 'relative' && (
        <div></div>
        // <RelativeSelector
        //   disabled={disabled}
        //   positionIndex={positionIndex}
        //   onPriceLimitChange={(value, limit) => handlePriceLimitChange(value, limit)}
        // />
      )}
      {/* {type === 'discrete' && <DiscreteSelector />} */}
    </Wrapper>
  )
}
