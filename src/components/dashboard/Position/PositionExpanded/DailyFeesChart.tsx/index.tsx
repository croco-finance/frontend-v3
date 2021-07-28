import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowBetween, RowFixed } from 'components/Row'
import { MonoSpace } from 'components/shared'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import React, { Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FeesChartEntry } from 'state/dashboard/reducer'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { toTwoNonZeroDecimals } from 'utils/numbers'

dayjs.extend(utc)

const DEFAULT_HEIGHT = 300

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  // height: ${DEFAULT_HEIGHT}px;
  padding: 0.5rem;
  // padding-right: 2rem;
  display: flex;
  // background-color: ${({ theme }) => theme.bg0}
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

const LeftFeesCard = styled.div`
  width: 100%;
  max-width: 200px;
  margin-bottom: 10px;
`

const RightFeesCard = styled.div`
  align-self: end;
  justify-items: flex-end;
`

const FeesCard = styled.div`
  margin-bottom: 10px;
`

const StyledPollingDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${(props) => props.color};
  margin-right: 8px;
`

const getAvergeFees = (dailyFees: FeesChartEntry[]): { feesToken0: number; feesToken1: number } => {
  const dataPointsCount = dailyFees.length
  let feesToken0Sum = 0
  let feesToken1Sum = 0

  for (let i = 0; i < dailyFees.length; i++) {
    feesToken0Sum += dailyFees[i].feesToken0
    feesToken1Sum += dailyFees[i].feesToken1
  }

  return {
    feesToken0: feesToken0Sum / dataPointsCount,
    feesToken1: feesToken1Sum / dataPointsCount,
  }
}

export type LineChartProps = {
  data: FeesChartEntry[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<{ feesToken0: number; feesToken1: number } | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: { feesToken0: number; feesToken1: number }
  label?: string
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
  token0Symbol: string | undefined
  token1Symbol: string | undefined
  token0Address: string
  token1Address: string
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({
  token0Symbol,
  token1Symbol,
  token0Address,
  token1Address,
  data,
  color = '#56B2A4',
  value,
  label,
  setValue,
  setLabel,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  const [leftLabel, setLeftLabel] = useState<string | undefined>()
  const [feesHover, setFeesHover] = useState<{ feesToken0: number; feesToken1: number } | undefined>()

  // if hover value undefined, reset to todays fees
  useEffect(() => {
    if (!feesHover && data) {
      // get last item in the array
      const lastItem = data.slice(-1)[0]

      if (lastItem) {
        setFeesHover({
          feesToken0: lastItem.feesToken0,
          feesToken1: lastItem.feesToken1,
        })
      }
    }
  }, [feesHover, data])

  const averageFees = useMemo(() => getAvergeFees(data), [data])

  return (
    <Wrapper>
      <RowBetween>
        <LeftFeesCard>
          <AutoColumn gap="4px">
            <TYPE.mediumHeader fontSize="16px">Daily Fees</TYPE.mediumHeader>
            <FeesCard>
              <RowBetween>
                <RowFixed height="34px">
                  <StyledPollingDot color={theme.blue1} />
                  <CurrencyLogo address={token0Address} size="14px" style={{ marginRight: '0.5rem' }} />
                  <TYPE.main fontSize="14px">{token0Symbol}</TYPE.main>
                </RowFixed>
                <TYPE.main fontSize="14px">{feesHover ? toTwoNonZeroDecimals(feesHover.feesToken0) : '-'}</TYPE.main>
              </RowBetween>

              <RowBetween>
                <RowFixed>
                  <StyledPollingDot color={theme.green1} />
                  <CurrencyLogo address={token1Address} size="14px" style={{ marginRight: '0.5rem' }} />
                  <TYPE.main fontSize="14px">{token1Symbol}</TYPE.main>
                </RowFixed>
                <TYPE.main fontSize="14px">{feesHover ? toTwoNonZeroDecimals(feesHover.feesToken1) : '-'}</TYPE.main>
              </RowBetween>
            </FeesCard>
            <TYPE.main fontSize="12px" height="14px">
              {leftLabel ? (
                <MonoSpace>{leftLabel}</MonoSpace>
              ) : (
                <MonoSpace>{dayjs.utc().format('MMM D, YYYY')}</MonoSpace>
              )}
            </TYPE.main>
          </AutoColumn>
        </LeftFeesCard>
        <RightFeesCard>
          <AutoColumn gap="4px" justify="flex-end">
            <TYPE.mediumHeader fontSize="16px">Daily Average</TYPE.mediumHeader>
            <FeesCard>
              <RowBetween>
                <RowFixed height="34px">
                  <TYPE.main fontSize="14px">{toTwoNonZeroDecimals(averageFees.feesToken0)}</TYPE.main>
                </RowFixed>
              </RowBetween>
              <TYPE.main fontSize="14px" textAlign="right">
                {toTwoNonZeroDecimals(averageFees.feesToken1)}
              </TYPE.main>
            </FeesCard>
          </AutoColumn>
        </RightFeesCard>
      </RowBetween>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          // height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          onMouseLeave={() => {
            setLabel && setLabel(undefined)
            setValue && setValue(undefined)
          }}
        >
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={darken(0.36, color)} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={(time) => dayjs(time).format('DD')}
            minTickGap={10}
          />
          <YAxis hide={true} yAxisId="left" tick={false} tickLine={false} axisLine={false} />
          <YAxis hide={true} yAxisId="right" orientation="right" tick={false} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: theme.bg2 }}
            contentStyle={{ display: 'none' }}
            formatter={(
              value: number,
              name: string,
              props: { payload: { date: string; feesToken0: number; feesToken1: number } }
            ) => {
              if (
                feesHover &&
                feesHover.feesToken0 !== props.payload.feesToken0 &&
                feesHover.feesToken1 !== props.payload.feesToken1
              ) {
                setFeesHover({ feesToken0: props.payload.feesToken0, feesToken1: props.payload.feesToken1 })
              }
              const formattedTime = dayjs(props.payload.date).format('MMM D, YYYY')
              if (setLeftLabel && label !== formattedTime) setLeftLabel(formattedTime)
            }}
          />
          <Line
            yAxisId="left"
            dataKey="feesToken0"
            type="monotone"
            stroke={theme.blue1}
            fill="url(#gradient)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            dataKey="feesToken1"
            type="monotone"
            stroke={theme.green1}
            fill="url(#gradient)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </Wrapper>
  )
}

export default Chart
