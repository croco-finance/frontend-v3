import React from 'react'
import { PositionInState } from 'state/dashboard/reducer'
import styled from 'styled-components'
import Position from 'components/dashboard/Position'

const Wrapper = styled.div`
  width: 100%;
`

interface Props {
  positions: PositionInState[]
}

const PositionsList = ({ positions }: Props) => {
  return (
    <Wrapper>
      {positions.map((position, i) => (
        <Position key={position.tokenId} positionIndex={i} position={position} />
      ))}
    </Wrapper>
  )
}

export default PositionsList
