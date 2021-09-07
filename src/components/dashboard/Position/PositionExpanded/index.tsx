import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DailyFeesChart from 'components/dashboard/Position/PositionExpanded/DailyFeesChart.tsx'
import DensityChart from 'components/DensityChart'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { Snapshot } from 'data/dashboard/expandedData'
import useTheme from 'hooks/useTheme'
import React, { useContext } from 'react'
import { useExpandedData } from 'state/dashboard/hooks'
import { usePoolDatas } from 'state/pools/hooks'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { formatAmount, formatDollarAmount, formatPercentageValue, toTwoNonZeroDecimals } from 'utils/numbers'
import { getRelativeImpLoss } from 'utils/simulator'
import Icon from 'components/Icon'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Interactions from './Interactions'
import { VMContext } from 'pages/App'

dayjs.extend(utc)

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

const FirstRowCardNarrow = styled(FirstRowCard)`
  width: 25%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  `};
`

const FirstRowCardWide = styled(FirstRowCard)`
  width: 51%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
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

const Dark = styled.div`
  color: ${({ theme }) => theme.text3};
`

interface ImpermanentLossInfo {
  differenceToken0: number
  differenceToken1: number
  impLossUSD: number
  impLossRelative: number
  impLossSinceTimestamp: number
  lastSnapAction: 'DEPOSIT' | 'WITHDRAW'
}
const getImpermanentLoss = (
  snapshots: Snapshot[],
  token0CurrentAmount: number,
  token1CurrentAmount: number,
  token0priceUSD: number,
  token1priceUSD: number
): ImpermanentLossInfo => {
  //  returns impermanent loss and token differences since last snapshot (deposit/withdrawal)
  // find last snap accociated with deposit or withdrawal (not fee collection)
  let lastSnap = snapshots[0]
  let lastSnapAction: ImpermanentLossInfo['lastSnapAction'] = 'DEPOSIT'

  snapshots.forEach((snap) => {
    // if there is some change in deposits, set new lastSnap
    if (
      snap.depositedToken0 !== lastSnap.depositedToken0 ||
      snap.depositedToken1 !== lastSnap.depositedToken1 ||
      snap.withdrawnToken0 !== lastSnap.withdrawnToken0 ||
      snap.withdrawnToken1 !== lastSnap.withdrawnToken1
    ) {
      if (snap.depositedToken0 > lastSnap.depositedToken0 || snap.depositedToken1 > lastSnap.depositedToken1)
        lastSnapAction = 'DEPOSIT'

      if (snap.withdrawnToken0 > lastSnap.withdrawnToken0 || snap.withdrawnToken1 > lastSnap.withdrawnToken1)
        lastSnapAction = 'WITHDRAW'

      lastSnap = snap
    }
  })

  const token0LastSnapAmount = Number(lastSnap.amountToken0.toSignificant())
  const token1LastSnapAmount = Number(lastSnap.amountToken1.toSignificant())

  // compute impermanent loss
  const hodlValueUSD = token0LastSnapAmount * token0priceUSD + token1LastSnapAmount * token1priceUSD
  const currentValueUSD = token0CurrentAmount * token0priceUSD + token1CurrentAmount * token1priceUSD

  const impLossUSD = hodlValueUSD - currentValueUSD
  const impLossRelative = getRelativeImpLoss(currentValueUSD, hodlValueUSD)

  const differenceToken0 = token0CurrentAmount - token0LastSnapAmount
  const differenceToken1 = token1CurrentAmount - token1LastSnapAmount

  return {
    differenceToken0: differenceToken0 || 0,
    differenceToken1: differenceToken1 || 0,
    impLossUSD: impLossUSD || 0,
    impLossRelative: impLossRelative || 0,
    impLossSinceTimestamp: lastSnap.transaction.timestamp * 1000,
    lastSnapAction,
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
  token0priceUSD: number
  token1priceUSD: number
  token0CurrentAmount: number
  token1CurrentAmount: number
  liquidityUSD: number
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
  token0priceUSD,
  token1priceUSD,
  token0CurrentAmount,
  token1CurrentAmount,
  liquidityUSD,
}: Props) => {
  const theme = useTheme()
  const vm = useContext(VMContext)
  const expandedInfo = useExpandedData(owner, tokenId, vm)
  // liquidity distribution data
  const poolData = usePoolDatas([poolAddress])[0]
  const impLossData = expandedInfo?.snapshots
    ? getImpermanentLoss(
        expandedInfo.snapshots,
        Number(token0CurrentAmount),
        Number(token1CurrentAmount),
        token0priceUSD,
        token1priceUSD
      )
    : undefined

  // check if the last interaction with WITHDRAW/DEPOSIT tag is also the first interaction.
  // If so, we can hide some things in the UI so it's more clean
  const firstSnapTimestamp = expandedInfo ? expandedInfo.snapshots[0].transaction.timestamp * 1000 : 0
  const lastInteractionIsFirstSnapshot = impLossData?.impLossSinceTimestamp === firstSnapTimestamp

  return (
    <Wrapper>
      <CardsWrapper>
        <FirstRowCardNarrow>
          <AutoColumn gap="md">
            {typeof expandedInfo?.collectedFeesToken0 === 'number' &&
            typeof expandedInfo?.collectedFeesToken1 === 'number' ? (
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
        </FirstRowCardNarrow>
        <FirstRowCardNarrow>
          <AutoColumn gap="md">
            {liquidityUSD === 0 ? (
              <>
                <RowBetween>
                  <Label>ROI and APR</Label>
                </RowBetween>
                <RowBetween>-</RowBetween>
              </>
            ) : (typeof expandedInfo?.roiETH === 'number' ||
                typeof expandedInfo?.roiUSD === 'number' ||
                typeof expandedInfo?.apr === 'number') &&
              impLossData &&
              impLossData.impLossSinceTimestamp ? (
              <>
                <RowBetween>
                  {lastInteractionIsFirstSnapshot ? (
                    <Label>ROI and APR</Label>
                  ) : (
                    <MouseoverTooltip
                      text={`ROI and APR estimate since ${dayjs(impLossData.impLossSinceTimestamp).format(
                        'MMM D, YYYY'
                      )} - date of your last ${impLossData.lastSnapAction === 'DEPOSIT' ? 'deposit' : 'withdrawal'} 
                   .`}
                    >
                      <Label>
                        ROI and APR since {dayjs(impLossData.impLossSinceTimestamp).format('MMM D')}
                        <Icon icon="QUESTION_ACTIVE" size={18} color={theme.text3} style={{ marginLeft: '2px' }} />
                      </Label>
                    </MouseoverTooltip>
                  )}
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>ROI USD</TYPE.main>
                  </RowFixed>
                  <TYPE.main>
                    {expandedInfo?.roiUSD && expandedInfo?.roiUSD !== Infinity
                      ? formatPercentageValue(expandedInfo?.roiUSD)
                      : '-'}
                  </TYPE.main>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>ROI ETH</TYPE.main>
                  </RowFixed>
                  <TYPE.main>
                    {expandedInfo?.roiETH && expandedInfo?.roiETH !== Infinity
                      ? formatPercentageValue(expandedInfo?.roiETH)
                      : '-'}
                  </TYPE.main>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    {lastInteractionIsFirstSnapshot ? (
                      <Dark>APR USD Est.</Dark>
                    ) : (
                      <MouseoverTooltip
                        text={`Expected APR based on our ROI since ${dayjs(impLossData.impLossSinceTimestamp).format(
                          'MMM D, YYYY'
                        )} - date of your last ${impLossData.lastSnapAction === 'DEPOSIT' ? 'deposit' : 'withdrawal'} 
                 .`}
                      >
                        <Dark style={{ display: 'flex', alignItems: 'center' }}>
                          APR USD Est.
                          <Icon icon="QUESTION_ACTIVE" size={18} color={theme.text3} style={{ marginLeft: '2px' }} />
                        </Dark>
                      </MouseoverTooltip>
                    )}
                  </RowFixed>
                  <Dark>
                    {expandedInfo?.apr && expandedInfo?.apr !== Infinity
                      ? formatPercentageValue(expandedInfo?.apr)
                      : '-'}
                  </Dark>
                </RowBetween>
              </>
            ) : (
              <Loader />
            )}
          </AutoColumn>
        </FirstRowCardNarrow>
        <FirstRowCardWide>
          <AutoColumn gap="md">
            {liquidityUSD === 0 ? (
              <>
                <RowBetween>
                  <Label>Impermanent loss</Label>
                </RowBetween>
                <RowBetween>-</RowBetween>
              </>
            ) : impLossData ? (
              <>
                <RowBetween>
                  {lastInteractionIsFirstSnapshot ? (
                    <MouseoverTooltip
                      text={`Impermanent loss -  
                   This is how much you've lost compared to just holding the underlying tokens.`}
                    >
                      <Label>Impermanent loss</Label>
                    </MouseoverTooltip>
                  ) : (
                    <MouseoverTooltip
                      text={`Impermanent loss since ${dayjs(impLossData.impLossSinceTimestamp).format(
                        'MMM D, YYYY'
                      )} - date of your last ${impLossData.lastSnapAction === 'DEPOSIT' ? 'deposit' : 'withdrawal'} 
 (This is how much you've lost compared to just holding the underlying tokens).`}
                    >
                      <Label>
                        Imp. loss since {dayjs(impLossData.impLossSinceTimestamp).format('MMM D')}
                        <Icon icon="QUESTION_ACTIVE" size={18} color={theme.text3} style={{ marginLeft: '2px' }} />:
                      </Label>
                    </MouseoverTooltip>
                  )}

                  {impLossData.impLossUSD > 0 ? (
                    <Il style={{ color: theme.red1 }}>
                      {formatDollarAmount(impLossData.impLossUSD)}
                      <RelIl>{formatPercentageValue(impLossData.impLossRelative)}</RelIl>
                    </Il>
                  ) : (
                    '-'
                  )}
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>{token0Symbol}</TYPE.main>
                  </RowFixed>
                  <TYPE.main>
                    {impLossData.differenceToken0 > 0 ? '+' : ''}
                    {impLossData.differenceToken0 ? toTwoNonZeroDecimals(impLossData.differenceToken0) : '-'}
                  </TYPE.main>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <TYPE.main>{token1Symbol}</TYPE.main>
                  </RowFixed>
                  <TYPE.main>
                    {impLossData.differenceToken1 > 0 ? '+' : ''}
                    {impLossData.differenceToken0 ? toTwoNonZeroDecimals(impLossData.differenceToken1) : '-'}
                  </TYPE.main>
                </RowBetween>
                <RowBetween>
                  <RowFixed>
                    <Dark>{"ROI USD if you HODL'd"}</Dark>
                  </RowFixed>
                  <Dark>
                    {expandedInfo?.roiHODL && expandedInfo?.roiHODL !== Infinity
                      ? formatPercentageValue(expandedInfo?.roiHODL)
                      : '-'}
                  </Dark>
                </RowBetween>
              </>
            ) : (
              <Loader />
            )}
          </AutoColumn>
        </FirstRowCardWide>
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
      <Interactions interactions={expandedInfo?.interactions} token0Symbol={token0Symbol} token1Symbol={token1Symbol} />
    </Wrapper>
  )
}

export default PositionExpanded
