import useTheme from 'hooks/useTheme'
import React from 'react'
import styled from 'styled-components'
import { useExpandedData } from 'state/dashboard/hooks'
import Loader from 'components/Loader'
import DailyFeesChart from 'components/dashboard/Position/PositionExpanded/DailyFeesChart.tsx'
import { usePoolDatas } from 'state/pools/hooks'
import DensityChart from 'components/DensityChart'
import { LightCard } from 'components/Card'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  margin-top: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `};
`

const DailyFeesWrapper = styled(LightCard)`
  width: 50%;
  margin-right: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin: 0 0 5px 0;
  `};
`
const DensityChartWrapper = styled(LightCard)`
  width: 50%;
  margin-left: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin: 5px 0 0 0;
  `};
`

interface Props {
  tokenId: number
  owner: string
  poolAddress: string
}

const PositionExpanded = ({ tokenId, owner, poolAddress }: Props) => {
  const theme = useTheme()
  const expandedInfo = useExpandedData(owner, tokenId)
  // liquidity distribution data
  const poolData = usePoolDatas([poolAddress])[0]

  return (
    <Wrapper>
      <DailyFeesWrapper>{expandedInfo?.dailyFees ? <div>DAILY FEES</div> : <Loader />}</DailyFeesWrapper>
      <DensityChartWrapper>{poolData ? <DensityChart address={poolAddress} /> : <Loader />}</DensityChartWrapper>
    </Wrapper>
  )
}

export default PositionExpanded
