/* eslint-disable max-classes-per-file */
import React, { PureComponent } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis, Label } from 'recharts'
import styled, { DefaultTheme } from 'styled-components'

const Title = styled.div`
  color: ${({ theme }) => theme.text2};
  text-align: center;
  width: 100%;
`

interface ChartDataItem {
  price: number
  liquidityValues: Array<number | undefined>
}

interface Props {
  height?: number
  data: ChartDataItem[]
  currentPrice: number
  simulatedPrice: number | null
  tokenSymbols: string[]
  theme: DefaultTheme
  maxInvestment: number
}

interface State {
  highlightedAreaId: string | null
}

class SimulatedDensityChart extends PureComponent<Props, State> {
  render() {
    const { theme, currentPrice, simulatedPrice, data, maxInvestment, tokenSymbols } = this.props

    return (
      <div>
        <Title>Current liquidity distribution</Title>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            width={800}
            height={320}
            data={data}
            margin={{
              top: 40,
              right: 10,
              bottom: 40,
              left: 70,
            }}
          >
            <CartesianGrid strokeDasharray="2 2" />
            {/* consider adding reference area for the liquidity amount 
                        https://gaurav5430.medium.com/exploring-recharts-reference-area-2fd68bb33ca5 */}
            {data.map((_data, i) => {
              const dataKeyName = `liquidityValues[${i}]`
              return (
                <Area
                  key={dataKeyName}
                  isAnimationActive={false}
                  dataKey={dataKeyName}
                  name={`${i}`}
                  fill={theme.blue1}
                  strokeWidth={1.5}
                  fillOpacity={0.8}
                />
              )
            })}

            <XAxis
              type="number"
              xAxisId={0}
              dataKey="price"
              tick={{
                fontSize: theme.fontSize.small,
              }}
              domain={['dataMin', 'dataMax']}
            >
              <Label
                value={`${tokenSymbols[0]} / ${tokenSymbols[1]}`}
                position="bottom"
                offset={15}
                style={{
                  textAnchor: 'middle',
                  fontSize: theme.fontSize.normal,
                  fill: theme.text2,
                }}
              />
            </XAxis>

            <YAxis
              tick={{ fontSize: theme.fontSize.small }}
              domain={[0, 1.2 * maxInvestment]}
              label={{
                value: 'Liquidity',
                angle: -90,
                offset: 460,
                position: 'center',
                dx: -90,
                style: {
                  textAnchor: 'middle',
                  fontSize: theme.fontSize.normal,
                  fill: theme.text2,
                },
              }}
            />
            <ReferenceLine
              x={currentPrice}
              strokeDasharray="3 3"
              isFront
              stroke={theme.blue1}
              label={{
                position: 'top',
                value: 'Current price',
                fill: theme.blue2,
                fontSize: 14,
              }}
            />

            {simulatedPrice && (
              <ReferenceLine
                x={simulatedPrice}
                strokeDasharray="3 3"
                isFront
                stroke={theme.green1}
                label={{
                  position: 'top',
                  value: 'Simulated',
                  fill: theme.green1,
                  fontSize: 14,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default SimulatedDensityChart
