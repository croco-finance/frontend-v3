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
import { DarkCard } from 'components/Card'

const Header = styled(DarkCard)`
  display: flex;
  margin-bottom: 44px;
  align-items: flex-end;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  `};
`
const InputLabel = styled.div`
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  padding-left: 10px;
  margin-bottom: 10px;
`

const PoolSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin-right: 0;
  `};
`

const ContentWrapper = styled.div`
  padding: 10px 0;
`

const SectionHeadline = styled(ContentWrapper)`
  padding: 16px 20px;
  font-size: ${({ theme }) => theme.fontSize.normal};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.black};
  border-radius: 10px 10px 0 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const ChosenPoolWrapper = styled.div`
  display: flex;
  aign-items: center;
  padding-left: 20px;
  border-left: 1px solid ${({ theme }) => theme.text5};
  height: 44px;
  align-items: center;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  min-width: 160px;
  width: 100%;
  max-width: 430px;
  margin-left: 20px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  border: none;
  margin-left: 0;
  padding-left: 10px;
  max-width: 100%;
  `};
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
  padding-left: 16px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const PositionWrapper = styled.div`
  margin-bottom: 20px;
`

const Content = styled.div``

const PositionsSelectorWrapper = styled(ContentWrapper)``

const AddPositionButtonWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: flex-end;
  width: 200px;
  margin: 0px 20px 20px auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-right: 10px;
 `};
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
  margin-right: 0;
  margin-bottom: 20px;
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
  border-radius: 0 0 10px 10px;
`

const Error = styled.div`
  width: 100%;
  color: ${({ theme }) => theme.warning};
  padding: 16px;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  align-items: center;
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
              tokenBase: token0,
              tokenQuote: token1,
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
              tokenBase: token0,
              tokenQuote: token1,
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
      <Header>
        <PoolSelectWrapper>
          <InputLabel>Choose pool</InputLabel>
          <PoolSelect />
        </PoolSelectWrapper>
        {showChosenPool && feeTier ? (
          <ChosenPoolWrapper>
            <DoubleCurrencyLogo
              address0={priceRatioOrder === 'default' ? tokenAddresses[0] : tokenAddresses[1]}
              address1={priceRatioOrder === 'default' ? tokenAddresses[1] : tokenAddresses[0]}
              size={20}
            />
            <ChosenTokenSymbols>
              {priceRatioOrder === 'default'
                ? `${tokenSymbols[0]} / ${tokenSymbols[1]}`
                : `${tokenSymbols[1]} / ${tokenSymbols[0]}`}
            </ChosenTokenSymbols>
            {feeTier / 10000}%
          </ChosenPoolWrapper>
        ) : null}
      </Header>
      {loading && <Loader />}
      {error && (
        <Error>
          <Loader /> We are trying to load prices for tokens in this pool. If not loading, try it again in a while.
        </Error>
      )}
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
