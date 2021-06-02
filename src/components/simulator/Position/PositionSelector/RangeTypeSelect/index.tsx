import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text3};
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
`

const Title = styled.div`
  margin-right: 10px;
`

const Button = styled.button<{ selected: boolean }>`
  padding: 6px;
  border-radius: 4px;
  margin: 0 4px;
  border: none;
  background: ${(props) => (props.selected ? props.theme.bg3 : 'inherit')};
  cursor: pointer;
  color: ${(props) => (props.selected ? props.theme.white : props.theme.text3)};
`

export type RangeTypes = 'absolute' | 'relative'

interface Props {
  typeSelected: RangeTypes
  onTypeChange: (type: RangeTypes) => void
}

// eslint-disable-next-line no-empty-pattern
export default function RangeTypeSelect({ typeSelected, onTypeChange }: Props) {
  return (
    <Wrapper>
      <Title>Range type:</Title>
      <Button
        selected={typeSelected === 'absolute'}
        onClick={() => {
          onTypeChange('absolute')
        }}
      >
        Absolute
      </Button>
      <Button
        selected={typeSelected === 'relative'}
        onClick={() => {
          onTypeChange('relative')
        }}
      >
        Relative
      </Button>
    </Wrapper>
  )
}
