import { ButtonSecondary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import Loader from 'components/Loader'
import SimulatedDensityChart from 'components/SimulatedDensityChart'
import PoolSelect from 'components/simulator/PoolSelect'
import Position from 'components/simulator/Position'
import PriceReferenceSwitch from 'components/simulator/PriceReferenceSwitch'
import PriceSimulationBox from 'components/simulator/PriceSimulationBox'
import { useColor } from 'hooks/useColor'
import useTheme from 'hooks/useTheme'
import { PageWrapper, ThemedBackground } from 'pages/styled'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import { usePoolDatas } from 'state/pools/hooks'
import {
  addPosition,
  setDefaultSliderPriceCoefficient,
  setError,
  setNewSimulationPoolData,
  setSimulatedPriceCoefficients,
} from 'state/simulator/actions'
import { useAllSimulatorData } from 'state/simulator/hooks'
import { useAddTokenKeys, useAllTokenData } from 'state/tokens/hooks'
import styled from 'styled-components'
import { multiplyArraysElementWise } from 'utils/math'
import { getDataForSimulatedDensityChart } from 'utils/simulator'

const ContentWrapper = styled.div`
  padding: 10px 0;
`

const SectionHeadline = styled(ContentWrapper)`
  padding: 20px;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const PoolSelectTitle = styled.div`
  margin-right: 10px;
  width: 140px;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const ChosenPoolWrapper = styled.div`
  display: flex;
  aign-items: center;
  padding-left: 20px;
  border-left: 1px solid ${({ theme }) => theme.text4};
  height: 36px;
  align-items: center;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  min-width: 160px;
`
const ChosenTokenSymbols = styled.div`
  margin: 0 10px;
  font-size: ${({ theme }) => theme.fontSize.normal};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  `};
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
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const PositionWrapper = styled.div`
  margin-bottom: 20px;
`

const PoolSelectHeader = styled(ContentWrapper)`
  align-items: center;
  display: flex;
  padding-bottom: 20px;
`

const Content = styled.div`
  border-top: 1px solid ${({ theme }) => theme.text4};
`

const PoolSelectWrapper = styled.div`
  width: 100%;
  max-width: 430px;
  margin-right: 20px;
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

const SimulationBoxAndChartWrapper = styled.div`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
`};
`

const SimulationBoxSectionWrapper = styled.div`
  width: 50%;
  margin-right: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin: 0;
`};
`

const LiquidityChartSectionWrapper = styled.div`
  width: 50%;
  margin-left: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin: 0;
`};
`

const LiquidityChartWrapper = styled.div`
  padding: 10px;
  background-color: ${({ theme }) => theme.bg0};
  border-radius: 10px;
`

const Error = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.red1};
  padding: 20px 0;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
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
    feeTier,
    priceRatioOrder,
    error,
  } = useAllSimulatorData()

  const poolData = usePoolDatas([address])[0]
  const allTokens = useAllTokenData()
  const [loading, setLoading] = useState(false)
  const addTokenKeys = useAddTokenKeys()

  useEffect(() => {
    setLoading(true)
    dispatch(setError({ isError: false }))

    if (poolData && allTokens && Object.keys(poolData).length !== 0 && Object.keys(allTokens).length !== 0) {
      const { token0, token1 } = poolData
      const token0Address = token0.address
      const token1Address = token1.address

      if (token0Address && token1Address) {
        // check if we have necessary data
        if (!allTokens[token0Address]) {
          addTokenKeys([token0Address])
          setLoading(false)
          return
        }

        if (!allTokens[token1Address]) {
          addTokenKeys([token1Address])
          setLoading(false)
          return
        }

        // get token prices
        const token0PriceUSD = allTokens[token0Address].data?.priceUSD
        const token1PriceUSD = allTokens[token1Address].data?.priceUSD

        // if we have valid prices (number greater than 0, set new simulation data)
        if (token0PriceUSD && token1PriceUSD) {
          dispatch(
            setNewSimulationPoolData({
              poolId: address,
              tokenSymbols: [token0.symbol, token1.symbol],
              tokenAddresses: [token0.address, token1.address],
              tokenWeights: [0.5, 0.5],
              currentTokenPricesUsd: [token0PriceUSD, token1PriceUSD],
              poolTokenReserves: [poolData.tvlToken0, poolData.tvlToken1],
              feeTier: poolData.feeTier,
              volume24Usd: poolData.volumeUSD,
              positions: [], // clear all positions
            })
          )
          dispatch(addPosition())
        } else {
          dispatch(
            setNewSimulationPoolData({
              poolId: address,
              tokenSymbols: [token0.symbol, token1.symbol],
              tokenAddresses: [token0.address, token1.address],
              tokenWeights: [0.5, 0.5],
              currentTokenPricesUsd: [token0PriceUSD || 0, token1PriceUSD || 0],
              poolTokenReserves: [poolData.tvlToken0, poolData.tvlToken1],
              feeTier: poolData.feeTier,
              volume24Usd: poolData.volumeUSD,
              positions: [], // clear all positions
            })
          )
          // set fetch error
          dispatch(setError({ isError: true }))
        }
      }
    }
    setLoading(false)
  }, [address, dispatch, poolData, allTokens, addTokenKeys])

  const currentPriceRatio = currentTokenPricesUsd[0] / currentTokenPricesUsd[1]
  const simulatedTokenPricesUsd = multiplyArraysElementWise(currentTokenPricesUsd, simulatedPriceCoefficients)
  const simulatedPriceRatio = simulatedTokenPricesUsd[0] / simulatedTokenPricesUsd[1]

  const { chartData, maxInvestment } = getDataForSimulatedDensityChart(positions)

  const showChosenPool = !loading && feeTier && allTokens[tokenAddresses[0]] && allTokens[tokenAddresses[1]]
  const showContent =
    !loading && !error && address && poolData && feeTier && allTokens[tokenAddresses[0]] && allTokens[tokenAddresses[1]]

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <PoolSelectHeader>
        <PoolSelectTitle>Choose pool</PoolSelectTitle>
        <PoolSelectWrapper>
          <PoolSelect />
        </PoolSelectWrapper>
        {showChosenPool && feeTier ? (
          <ChosenPoolWrapper>
            <DoubleCurrencyLogo
              address0={priceRatioOrder === 'default' ? tokenAddresses[0] : tokenAddresses[1]}
              address1={priceRatioOrder === 'default' ? tokenAddresses[1] : tokenAddresses[0]}
              size={22}
            />
            <ChosenTokenSymbols>
              {priceRatioOrder === 'default'
                ? `${tokenSymbols[0]} / ${tokenSymbols[1]}`
                : `${tokenSymbols[1]} / ${tokenSymbols[0]}`}
            </ChosenTokenSymbols>
            {feeTier / 10000}%
          </ChosenPoolWrapper>
        ) : null}
      </PoolSelectHeader>
      {loading && <Loader />}
      {error && <Error>Sorry, we can&apos;t load prices for tokens in this pool.</Error>}
      {showContent ? (
        <Content>
          <PositionsHeadline>
            <PositionsTitle>Define positions</PositionsTitle>
            {positions.length > 0 && <PriceReferenceSwitch />}
          </PositionsHeadline>
          <PositionsSelectorWrapper>
            {/* TODO change the way how you render this. "positions" array will get re-render every time you change something in any of the positions */}
            {/* Consider using something like React.memo */}
            {positions.map((position, i) => (
              <PositionWrapper key={position.id}>
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
          <SimulationBoxAndChartWrapper>
            <SimulationBoxSectionWrapper>
              <SectionHeadline>Simulate token prices</SectionHeadline>
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
            </SimulationBoxSectionWrapper>
            <LiquidityChartSectionWrapper>
              <SectionHeadline>Liquidity distribution</SectionHeadline>
              <LiquidityChartWrapper>
                <SimulatedDensityChart
                  theme={theme}
                  currentPrice={currentPriceRatio}
                  simulatedPrice={simulatedPriceRatio}
                  data={chartData}
                  maxInvestment={maxInvestment}
                  tokenSymbols={tokenSymbols}
                />
              </LiquidityChartWrapper>
            </LiquidityChartSectionWrapper>
          </SimulationBoxAndChartWrapper>
        </Content>
      ) : null}
    </PageWrapper>
  )
}

export default Simulator
