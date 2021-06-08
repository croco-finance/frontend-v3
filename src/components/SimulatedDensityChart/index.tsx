/* eslint-disable max-classes-per-file */
import React, { PureComponent } from 'react'
import { Area, AreaChart, CartesianGrid, Label, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { DefaultTheme } from 'styled-components'
import { formatDollarAmount, formatNumber } from 'utils/numbers'

export function ReferenceLabel(props: any) {
  const { fill, value, textAnchor, fontSize, viewBox, dy, dx } = props
  const x = viewBox.width + viewBox.x - 52
  const y = viewBox.y - 22
  return (
    <text x={x} y={y} dy={dy} dx={dx} fill={fill} fontSize={fontSize} textAnchor={textAnchor}>
      {value}
    </text>
  )
}

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
        {/* <Title>Liquidity distribution</Title> */}
        <ResponsiveContainer width="100%" height={314}>
          <AreaChart
            width={800}
            height={320}
            data={data}
            margin={{
              top: 40,
              right: 10,
              bottom: 40,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={theme.text4} />
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
                transform: 'translate(0, 6)',
              }}
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatNumber}
              tickCount={10}
              // interval={0}
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
              domain={[0, 1.25 * maxInvestment]}
              tick={{ fontSize: theme.fontSize.small }}
              tickFormatter={formatDollarAmount}
              tickCount={6}
            />
            <ReferenceLine
              x={currentPrice}
              strokeDasharray="3 3"
              isFront
              stroke={theme.pink1}
              // label={<ReferenceLabel value="Current Price" fill={theme.pink1} fontSize={14} />}
              label={{
                position: 'top',
                value: 'Current price',
                fill: theme.pink1,
                fontSize: 14,
              }}
            />

            {simulatedPrice && (
              <ReferenceLine
                x={simulatedPrice}
                strokeDasharray="3 3"
                isFront
                stroke={theme.green1}
                label={<ReferenceLabel value="Simulated price" fill={theme.green1} fontSize={14} />}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default SimulatedDensityChart
