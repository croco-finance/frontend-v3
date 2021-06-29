import { LightCard } from 'components/Card'
import DailyFeesChart from 'components/dashboard/Position/PositionExpanded/DailyFeesChart.tsx'
import DensityChart from 'components/DensityChart'
import Loader from 'components/Loader'
import useTheme from 'hooks/useTheme'
import React from 'react'
import { useExpandedData } from 'state/dashboard/hooks'
import { FeesChartEntry } from 'state/dashboard/reducer'
import { usePoolDatas } from 'state/pools/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'

const Wrapper = styled.div`
  display: flex;
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

interface Props {
  tokenId: number
  owner: string
  poolAddress: string
  token0Symbol: string | undefined
  token1Symbol: string | undefined
  token0Address: string
  token1Address: string
}

const PositionExpanded = ({
  tokenId,
  owner,
  poolAddress,
  token0Address,
  token1Address,
  token0Symbol,
  token1Symbol,
}: Props) => {
  const theme = useTheme()
  const expandedInfo = useExpandedData(owner, tokenId)
  // liquidity distribution data
  const poolData = usePoolDatas([poolAddress])[0]

  return (
    <Wrapper>
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
            <TYPE.mediumHeader fontSize="16px">Liquidity Distribution</TYPE.mediumHeader>
            <DensityChart address={poolAddress} small />
          </DensityChartWrapper2>
        ) : (
          <Loader />
        )}
      </DensityChartWrapper>
    </Wrapper>
  )
}

export default PositionExpanded
