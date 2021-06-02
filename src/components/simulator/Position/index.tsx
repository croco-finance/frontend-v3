import CollapsibleContainer from 'components/CollapsibleContainer'
import React, { useState } from 'react'
import { Position as PositionInterface } from 'state/simulator/reducer'
import styled from 'styled-components'
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
  min-width: 44%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  border-right: none;
  padding-right: 0;
  padding-bottom: 20px;
  margin-right: 0;
  margin-bottom: 20px;
  `}
`

const PositionOverviewWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-grow: 1;
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
  //   const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Wrapper>
      {/* TODO add "REMOVE POSITION button */}
      <CollapsibleContainer
        isOpenedDefault
        onChange={(isOpened: boolean) => {
          setIsExpanded(isOpened)
        }}
        header={
          <PositionHeadline isOpened={isExpanded}>
            Position #{positionIndex + 1}
            {/* {getPositionStatus(
                        simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1],
                        priceMin,
                        priceMax,
                    )} */}
            <ExpandButton>
              {/* <Icon icon={isExpanded ? 'ARROW_UP' : 'ARROW_DOWN'} size={16} color={theme.FONT_MEDIUM} /> */}
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
              {' '}
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
