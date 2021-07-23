import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { ResponsiveRow, RowBetween, RowFixed } from 'components/Row'
import LineChart from 'components/LineChart/alt'
import useTheme from 'hooks/useTheme'
import { useProtocolData, useProtocolChartData, useProtocolTransactions } from 'state/protocol/hooks'
import { DarkGreyCard } from 'components/Card'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { HideMedium, HideSmall, StyledInternalLink } from '../../theme/components'
import TokenTable from 'components/tokens/TokenTable'
import PoolTable from 'components/pools/PoolTable'
import { PageWrapper, ThemedBackgroundGlobal } from 'pages/styled'
import { unixToDate } from 'utils/date'
import BarChart from 'components/BarChart/alt'
import { useAllPoolData } from 'state/pools/hooks'
import { notEmpty } from 'utils'
import TransactionsTable from '../../components/TransactionsTable'
import { useAllTokenData } from 'state/tokens/hooks'
import { MonoSpace } from 'components/shared'
import Icon from 'components/Icon'
import dayjs from 'dayjs'

const ChartWrapper = styled.div`
  width: 49%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
  `};
`

const OldCrocoBanner = styled.div`
  color: white;
  background-color: ${({ theme }) => theme.green1};
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.medium}
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: end;
  margin-bottom: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 10px;
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`
const OldCrocoText = styled.div``

const OldCrocoLink = styled.a`
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  font-size: ${({ theme }) => theme.fontSize.h3};
  text-recoration: none;
  margin-left: 6px;
  color: #ffed00;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`
const OldCrocoDesc = styled.div`
  font-weight: ${({ theme }) => theme.fontWeight.regular};
  font-size: ${({ theme }) => theme.fontSize.normal};
  margin-top: 6px;
`

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const theme = useTheme()

  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()
  const [transactions] = useProtocolTransactions()

  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [leftLabel, setLeftLabel] = useState<string | undefined>()
  const [rightLabel, setRightLabel] = useState<string | undefined>()

  // get all the pool datas that exist
  const allPoolData = useAllPoolData()
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map((p) => p.data)
      .filter(notEmpty)
  }, [allPoolData])

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (!volumeHover && protocolData) {
      setVolumeHover(protocolData.volumeUSD)
    }
  }, [protocolData, volumeHover])
  useEffect(() => {
    if (!liquidityHover && protocolData) {
      setLiquidityHover(protocolData.tvlUSD)
    }
  }, [liquidityHover, protocolData])

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        }
      })
    } else {
      return []
    }
  }, [chartData])

  const allTokens = useAllTokenData()

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map((t) => t.data)
      .filter(notEmpty)
  }, [allTokens])

  return (
    <PageWrapper>
      <ThemedBackgroundGlobal backgroundColor={'#1054b5'} />
      <AutoColumn gap="16px">
        <OldCrocoBanner>
          <Icon icon="INFO" size={22} style={{ marginRight: '10px' }} color="white" />
          <OldCrocoText>
            The previous version of Croco Finance was moved to:
            <OldCrocoLink rel="noreferrer" target="_blank" href="https://old.croco.finance/">
              www.old.croco.finance
            </OldCrocoLink>
            .<OldCrocoDesc>We are now fully focused on the support of Uniswap v3.</OldCrocoDesc>
          </OldCrocoText>
        </OldCrocoBanner>
        <TYPE.main>Uniswap Overview</TYPE.main>
        <ResponsiveRow>
          <ChartWrapper>
            <LineChart
              data={formattedTvlData}
              height={220}
              minHeight={332}
              color={theme.green1}
              value={liquidityHover}
              label={leftLabel}
              setValue={setLiquidityHover}
              setLabel={setLeftLabel}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">TVL</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace>{formatDollarAmount(liquidityHover, 2, true)} </MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {leftLabel ? (
                      <MonoSpace>{leftLabel}</MonoSpace>
                    ) : (
                      <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                    )}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
          <ChartWrapper>
            <BarChart
              height={220}
              minHeight={332}
              data={formattedVolumeData}
              color={theme.blue1}
              setValue={setVolumeHover}
              setLabel={setRightLabel}
              value={volumeHover}
              label={rightLabel}
              topLeft={
                <AutoColumn gap="4px">
                  <TYPE.mediumHeader fontSize="16px">Volume 24H</TYPE.mediumHeader>
                  <TYPE.largeHeader fontSize="32px">
                    <MonoSpace> {formatDollarAmount(volumeHover, 2)}</MonoSpace>
                  </TYPE.largeHeader>
                  <TYPE.main fontSize="12px" height="14px">
                    {rightLabel ? (
                      <MonoSpace>{rightLabel}</MonoSpace>
                    ) : (
                      <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
                    )}
                  </TYPE.main>
                </AutoColumn>
              }
            />
          </ChartWrapper>
        </ResponsiveRow>
        <HideSmall>
          <DarkGreyCard>
            <RowBetween>
              <RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Volume 24H: </TYPE.main>
                  <TYPE.label mr="4px">{formatDollarAmount(protocolData?.volumeUSD)}</TYPE.label>
                  <Percent value={protocolData?.volumeUSDChange} wrap={true} />
                </RowFixed>
                <RowFixed mr="20px">
                  <TYPE.main mr="4px">Fees 24H: </TYPE.main>
                  <TYPE.label mr="4px">{formatDollarAmount(protocolData?.feesUSD)}</TYPE.label>
                  <Percent value={protocolData?.feeChange} wrap={true} />
                </RowFixed>
                <HideMedium>
                  <RowFixed mr="20px">
                    <TYPE.main mr="4px">TVL: </TYPE.main>
                    <TYPE.label mr="4px">{formatDollarAmount(protocolData?.tvlUSD)}</TYPE.label>
                    <TYPE.main></TYPE.main>
                    <Percent value={protocolData?.tvlUSDChange} wrap={true} />
                  </RowFixed>
                </HideMedium>
              </RowFixed>
            </RowBetween>
          </DarkGreyCard>
        </HideSmall>
        <RowBetween>
          <TYPE.main>Top Tokens</TYPE.main>
          <StyledInternalLink to="/tokens">Explore</StyledInternalLink>
        </RowBetween>
        <TokenTable tokenDatas={formattedTokens} />
        <RowBetween>
          <TYPE.main>Top Pools</TYPE.main>
          <StyledInternalLink to="/pools">Explore</StyledInternalLink>
        </RowBetween>
        <PoolTable poolDatas={poolDatas} />
        <RowBetween>
          <TYPE.main>Transactions</TYPE.main>
        </RowBetween>
        {transactions ? <TransactionsTable transactions={transactions} /> : null}
      </AutoColumn>
    </PageWrapper>
  )
}
