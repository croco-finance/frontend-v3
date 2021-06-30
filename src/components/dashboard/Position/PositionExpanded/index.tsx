import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DailyFeesChart from 'components/dashboard/Position/PositionExpanded/DailyFeesChart.tsx'
import DensityChart from 'components/DensityChart'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { Snapshot } from 'data/dashboard/expandedData'
import useTheme from 'hooks/useTheme'
import React from 'react'
import { useExpandedData } from 'state/dashboard/hooks'
import { usePoolDatas } from 'state/pools/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { formatAmount, formatDollarAmount, formatPercentageValue } from 'utils/numbers'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `};
`

const DailyFeesWrapper = styled(LightCard)`
  width: 50%;
  height: 400px;
  margin-right: 5px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin: 0 0 5px 0;
  `};
`
const DensityChartWrapper = styled(LightCard)`
  width: 50%;
  margin-left: 5px;
  height: 400px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin: 5px 0 0 0;
  `};
`

const DensityChartWrapper2 = styled.div`
  padding: 0.5rem;
`

const ChartsWrapper = styled.div`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `};
`

const FirstRowCard = styled(LightCard)`
  margin: 0 5px;
  min-height: 128px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  min-height: max-content;
  margin: 4px 0;
  `};
`
// responsive text
// disable the warning because we don't use the end prop, we just want to filter it out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Label = styled(({ end, ...props }) => <TYPE.label {...props} />)<{ end?: boolean }>`
  display: flex;
  font-size: 16px;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  align-items: center;
`

const CardsWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
  // width: 50%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  margin-bottom: 5px;
  `};
`
const Il = styled.div`
  display: flex;
`
const RelIl = styled.div`
  color: ${({ theme }) => theme.text3};
  border-left: 1px solid ${({ theme }) => theme.text4};
  padding-left: 8px;
  margin-left: 8px;
`

interface ImpermanentLossInfo {
  differenceToken0: number
  differenceToken1: number
  impLossUSD: number
  impLossRelative: number
}
const getImpermanentLoss = (snapshots: Snapshot[]): ImpermanentLossInfo => {
  //  returns impermanent loss and token differences since last snapshot (deposit/withdrawal)
  snapshots.forEach((snap: Snapshot) => {
    // TODO get necessary token amounts adn perform computations
    // console.log('snap 0', snap.amountToken0.toSignificant(4))
    // console.log('snap 1', snap.amountToken1.toSignificant(4))
    // console.log('--------------------------')
  })
  return {
    differenceToken0: 0,
    differenceToken1: 0,
    impLossUSD: 0,
    impLossRelative: 0,
  }
}

interface Props {
  tokenId: number
  owner: string
  poolAddress: string
  token0Symbol: string | undefined
  token1Symbol: string | undefined
  token0Address: string
  token1Address: string
  tickLower: number
  tickUpper: number
}

const PositionExpanded = ({
  tokenId,
  owner,
  poolAddress,
  token0Address,
  token1Address,
  token0Symbol,
  token1Symbol,
  tickLower,
  tickUpper,
}: Props) => {
  const theme = useTheme()
  const expandedInfo = useExpandedData(owner, tokenId)
  // liquidity distribution data
  const poolData = usePoolDatas([poolAddress])[0]
  const impLossData = expandedInfo?.snapshots ? getImpermanentLoss(expandedInfo.snapshots) : undefined

  return (
    <Wrapper>
      <CardsWrapper>
        <FirstRowCard>
          <AutoColumn gap="md">
            {expandedInfo?.collectedFeesToken0 && expandedInfo?.collectedFeesToken1 ? (
              <>
                <RowBetween>
                  <Label>Collected Fees:</Label>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>{token0Symbol}</TYPE.main>
                  </RowFixed>
                  <TYPE.main>{formatAmount(expandedInfo?.collectedFeesToken0)}</TYPE.main>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>{token1Symbol}</TYPE.main>
                  </RowFixed>
                  <TYPE.main>{formatAmount(expandedInfo?.collectedFeesToken1)}</TYPE.main>
                </RowBetween>
              </>
            ) : (
              <Loader />
            )}
          </AutoColumn>
        </FirstRowCard>
        <FirstRowCard>
          <AutoColumn gap="md">
            {impLossData ? (
              <>
                <RowBetween>
                  <MouseoverTooltip text="Impermanent loss since your last deposit / withdrawal">
                    <Label>Impermanent Loss:</Label>
                  </MouseoverTooltip>

                  <Il style={{ color: theme.red1 }}>
                    {formatDollarAmount(impLossData?.impLossUSD)}
                    <RelIl>{formatPercentageValue(impLossData?.impLossRelative)}</RelIl>
                  </Il>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>{token0Symbol}</TYPE.main>
                  </RowFixed>
                  <TYPE.main>{formatAmount(impLossData?.differenceToken0)}</TYPE.main>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>{token1Symbol}</TYPE.main>
                  </RowFixed>
                  <TYPE.main>{formatAmount(impLossData?.differenceToken1)}</TYPE.main>
                </RowBetween>
              </>
            ) : (
              <Loader />
            )}
          </AutoColumn>
        </FirstRowCard>
      </CardsWrapper>
      <ChartsWrapper>
        <DailyFeesWrapper>
          {expandedInfo?.dailyFees ? (
            <DailyFeesChart
              token0Address={token0Address}
              token1Address={token1Address}
              token0Symbol={token0Symbol}
              token1Symbol={token1Symbol}
              data={expandedInfo?.dailyFees}
            />
          ) : (
            <Loader />
          )}
        </DailyFeesWrapper>
        <DensityChartWrapper>
          {poolData ? (
            <DensityChartWrapper2>
              <TYPE.mediumHeader fontSize="16px" paddingBottom="16px">
                Liquidity Distribution
              </TYPE.mediumHeader>
              <DensityChart address={poolAddress} tickLower={tickLower} tickUpper={tickUpper} small />
            </DensityChartWrapper2>
          ) : (
            <Loader />
          )}
        </DensityChartWrapper>
      </ChartsWrapper>
    </Wrapper>
  )
}

export default PositionExpanded
