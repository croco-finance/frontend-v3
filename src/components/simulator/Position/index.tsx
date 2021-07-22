import RangeBadge from 'components/Badge/RangeBadge'
import CollapsibleContainer from 'components/CollapsibleContainer'
import Icon from 'components/Icon'
import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { Position as PositionInterface } from 'state/simulator/reducer'
import styled from 'styled-components'
import { multiplyArraysElementWise } from 'utils/math'
import PositionOverview from './PositionOverview'
import PositionSelector from './PositionSelector'

const Wrapper = styled.div``

const PositionHeadline = styled.div<{ isOpened: boolean }>`
  display: flex;
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  padding: 12px 20px;
  width: 100%;
  border-radius: ${(props) => (props.isOpened ? '10px 10px 0px 0px' : '10px')};
  background-color: ${({ theme }) => theme.black};
  align-items: center;
`

const PositionDataWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg0};
  border-radius: 0px 0px 10px 10px;
  display: flex;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `}
`

const PositionSelectorWrapper = styled.div`
  border-bottom: none;
  padding: 20px;
  border-right: 1px solid ${({ theme }) => theme.text5};
  border-bottom: none;
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  border-right: none;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  padding-bottom: 20px;
  margin-right: 0;
  margin-bottom: 20px;
  width: 100%;
  padding: 20px 10px;
  `}
`

const PositionOverviewWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-grow: 1;
  overflow-x: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  padding: 20px 10px;
  `}
`

const ExpandButton = styled.div`
  cursor: pointer;
  border-radius: 20px;
  width: 22px;
  height: 22px;
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: flex-end;
`

interface Props {
  positionIndex: number
  investmentUsd: PositionInterface['investmentUsd']
  priceMin: PositionInterface['priceMin']
  priceMax: PositionInterface['priceMax']
  infiniteRangeSelected: PositionInterface['infiniteRangeSelected']
}

export default function Position({ positionIndex, investmentUsd, priceMin, priceMax, infiniteRangeSelected }: Props) {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(true)
  const { simulatedPriceCoefficients, currentTokenPricesUsd } = useAllSimulatorData()
  const simulatedTokenPricesUsd = multiplyArraysElementWise(currentTokenPricesUsd, simulatedPriceCoefficients)

  const getIfInRange = (currentPrice: number, priceMin: number, priceMax: number) => {
    if (currentPrice < priceMin || currentPrice > priceMax) return false
    return true
  }

  return (
    <Wrapper>
      <CollapsibleContainer
        isOpened={isExpanded}
        header={
          <PositionHeadline
            isOpened={isExpanded}
            onClick={() => {
              setIsExpanded(!isExpanded)
            }}
          >
            Position #{positionIndex + 1}
            <div style={{ marginLeft: '8px' }}>
              <RangeBadge
                removed={false}
                inRange={getIfInRange(
                  simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1],
                  infiniteRangeSelected ? 0 : priceMin,
                  infiniteRangeSelected ? Infinity : priceMax
                )}
              />
            </div>
            <ExpandButton>
              <Icon icon={isExpanded ? 'ARROW_UP' : 'ARROW_DOWN'} size={16} color={theme.text2} />
            </ExpandButton>
          </PositionHeadline>
        }
        collapseBody={
          <PositionDataWrapper>
            <PositionSelectorWrapper>
              <PositionSelector
                positionIndex={positionIndex}
                investmentUsd={investmentUsd}
                priceMin={priceMin}
                priceMax={priceMax}
                infiniteRangeSelected={infiniteRangeSelected}
              />
            </PositionSelectorWrapper>
            <PositionOverviewWrapper>
              <PositionOverview
                positionIndex={positionIndex}
                investmentUsd={investmentUsd}
                priceMin={priceMin}
                priceMax={priceMax}
                infiniteRangeSelected={infiniteRangeSelected}
              />
            </PositionOverviewWrapper>
          </PositionDataWrapper>
        }
      />
    </Wrapper>
  )
}
