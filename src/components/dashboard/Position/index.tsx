import React, { useState } from 'react'
import { PositionData } from 'state/dashboard/reducer'
import styled from 'styled-components'
import CollapsibleContainer from 'components/CollapsibleContainer'
import useTheme from 'hooks/useTheme'
import PositionOverview from 'components/dashboard/Position/PositionOverview'
import PositionExpanded from 'components/dashboard/Position/PositionExpanded'
import { DarkCard } from 'components/Card'

const Wrapper = styled(DarkCard)`
  margin-bottom: 28px;
  width: 100%;
`

const PositionExpandedWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg0};
`

interface Props {
  positionIndex: number
  position: PositionData
}

const Position = ({ position, positionIndex }: Props) => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Wrapper>
      <CollapsibleContainer
        isOpened={isExpanded}
        header={
          <PositionOverview
            position={position.overview}
            positionIndex={positionIndex}
            isExpanded={isExpanded}
            handleShowExpanded={() => {
              setIsExpanded(!isExpanded)
            }}
          />
        }
        collapseBody={
          <PositionExpandedWrapper>
            {isExpanded ? (
              <PositionExpanded
                tokenId={position.tokenId}
                owner={position.overview.owner}
                poolAddress={position.overview.poolAddress}
                token0Address={position.overview.pool.token0.address}
                token1Address={position.overview.pool.token1.address}
                token0Symbol={position.overview.pool.token0.symbol}
                token1Symbol={position.overview.pool.token1.symbol}
              />
            ) : null}
          </PositionExpandedWrapper>
        }
      />
    </Wrapper>
  )
}

export default Position
