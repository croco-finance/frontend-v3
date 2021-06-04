import { ButtonSecondary } from 'components/Button'
import Position from 'components/simulator/Position'
import PriceReferenceSwitch from 'components/simulator/PriceReferenceSwitch'
import PriceSimulationBox from 'components/simulator/PriceSimulationBox'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  addPosition,
  setDefaultSliderPriceCoefficient,
  setSimulatedPriceCoefficients,
  setNewSimulationPoolData,
} from 'state/simulator/actions'
import { useAllSimulatorData } from 'state/simulator/hooks'
import styled from 'styled-components'
import SearchSmall from 'components/Search'
import { usePoolDatas } from 'state/pools/hooks'
import { RouteComponentProps } from 'react-router-dom'
import PoolSelect from 'components/simulator/PoolSelect'
import { useTokenPriceData, useAllTokenData } from 'state/tokens/hooks'
import { ThemedBackground, PageWrapper } from 'pages/styled'
import { useColor } from 'hooks/useColor'
import BarChart from 'components/BarChart'
import SimulatedDensityChart from 'components/SimulatedDensityChart'
import { multiplyArraysElementWise } from 'utils/math'
import { getDataForSimulatedDensityChart } from 'utils/simulator'
import Loader from 'components/Loader'

const Wrapper = styled.div`
  padding-bottom: 40px;
  width: 100%;
`

const ContentWrapper = styled.div`
  padding: 10px;
`

const SectionHeadline = styled(ContentWrapper)`
  padding: 20px;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  color: ${({ theme }) => theme.text2};
`

const PoolSelectTitle = styled.div`
  margin-right: 20px;
  width: 150px;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  color: ${({ theme }) => theme.text2};
`

const PositionsHeadline = styled(ContentWrapper)`
  display: flex;
  margin-top: 20px;
`

const PositionsTitle = styled.div`
  display: flex;
  flex-grow: 1;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  color: ${({ theme }) => theme.text2};
`

const PositionWrapper = styled.div`
  margin-bottom: 20px;
`

const PoolSelectWrapper = styled(ContentWrapper)`
  align-items: center;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.text4};
  padding-bottom: 20px;
`

const PositionsSelectorWrapper = styled(ContentWrapper)``

const AddPositionButtonWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  margin-top: 10px;
  width: 200px;
  margin: 0 20px 0 auto;
`

const AddPositionButton = styled(ButtonSecondary)`
  padding: 10px;
`

const SimulationBoxWrapper = styled(ContentWrapper)`
  display: flex;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  flex-direction: column;
  `}
`

const ChartWrapper = styled.div`
  padding: 20px;
  width: 620px;
  margin-left: 50px;
  background-color: ${({ theme }) => theme.bg0};
`

const Simulator = ({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const backgroundColor = useColor(address)
  const theme = useTheme()
  const dispatch = useDispatch()
  const {
    simulatedPriceCoefficients,
    poolId,
    tokenAddresses,
    tokenSymbols,
    currentTokenPricesUsd,
    positions,
  } = useAllSimulatorData()

  const poolData = usePoolDatas([address])[0]
  const allTokens = useAllTokenData()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    if (poolData && allTokens && Object.keys(poolData).length !== 0 && Object.keys(allTokens).length !== 0) {
      const token0Address = poolData.token0.address
      const token1Address = poolData.token1.address

      const token0PriceUSD = allTokens[token0Address].data?.priceUSD
      const token1PriceUSD = allTokens[token1Address].data?.priceUSD

      if (token0PriceUSD && token1PriceUSD) {
        dispatch(
          setNewSimulationPoolData({
            poolId: address,
            tokenSymbols: [poolData.token0.symbol, poolData.token1.symbol],
            tokenAddresses: [poolData.token0.address, poolData.token1.address],
            tokenWeights: [0.5, 0.5],
            currentTokenPricesUsd: [token0PriceUSD, token1PriceUSD],
            poolTokenReserves: [poolData.tvlToken0, poolData.tvlToken1],
            swapFee: poolData.feeTier,
            volume24Usd: poolData.volumeUSD,
            positions: [], // clear all positions
          })
        )
        dispatch(addPosition())
      }
    }
    setLoading(false)

    // check if pool address in url
    // if not address in url, allow user to set pool via search
  }, [address, dispatch, poolData, allTokens])

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]
  const simulatedTokenPricesUsd = multiplyArraysElementWise(currentTokenPricesUsd, simulatedPriceCoefficients)
  const simulatedPriceRatio = simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1]

  const { chartData, maxInvestment } = getDataForSimulatedDensityChart(positions)

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <PoolSelectWrapper>
        <PoolSelectTitle>Choose pool: </PoolSelectTitle>
        <PoolSelect />
      </PoolSelectWrapper>
      {loading && <Loader />}
      {!loading && address && poolData && allTokens && (
        <>
          <PositionsHeadline>
            <PositionsTitle>Define your positions</PositionsTitle>
            {positions.length > 0 && <PriceReferenceSwitch />}
          </PositionsHeadline>
          <PositionsSelectorWrapper>
            {/* TODO change the way how you render this. "positions" array will get re-render every time you change something in any of the positions */}
            {/* Consider using something like React.memo */}
            {positions.map((position, i) => (
              <PositionWrapper key={`${i}`}>
                <Position
                  positionIndex={i}
                  investmentUsd={position.investmentUsd}
                  priceMin={position.priceMin}
                  priceMax={position.priceMax}
                  infiniteRangeSelected={position.infiniteRangeSelected}
                />
              </PositionWrapper>
            ))}
            <AddPositionButtonWrapper>
              <AddPositionButton
                onClick={() => {
                  dispatch(addPosition())
                }}
              >
                Add Position
              </AddPositionButton>
            </AddPositionButtonWrapper>
          </PositionsSelectorWrapper>
          {/* TODO add overall positions overview */}
          <SectionHeadline>Simulate token prices</SectionHeadline>
          <SimulationBoxWrapper>
            <PriceSimulationBox
              poolId={poolId}
              tokenSymbols={tokenSymbols}
              tokenAddresses={tokenAddresses}
              currentTokenPrices={currentTokenPricesUsd}
              simulatedCoefficients={simulatedPriceCoefficients}
              onSliderMoveChange={(newValue, index) => dispatch(setSimulatedPriceCoefficients({ newValue, index }))}
              onNewDefaultSliderValue={(newValue, index) =>
                dispatch(setDefaultSliderPriceCoefficient({ newValue, index }))
              }
            />

            <ChartWrapper>
              <SimulatedDensityChart
                theme={theme}
                currentPrice={currentPriceRatio}
                simulatedPrice={simulatedPriceRatio}
                data={chartData}
                maxInvestment={maxInvestment}
                tokenSymbols={tokenSymbols}
              />
            </ChartWrapper>
          </SimulationBoxWrapper>
        </>
      )}
    </PageWrapper>
  )
}

export default Simulator
