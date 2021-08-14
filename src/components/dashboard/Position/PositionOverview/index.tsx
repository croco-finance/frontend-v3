import { Percent, Price, Token } from '@uniswap/sdk-core'
import Badge from 'components/Badge'
import RangeBadge from 'components/Badge/RangeBadge'
import { ButtonSecondary } from 'components/Button'
import { LightCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import Icon from 'components/Icon'
import { RowBetween, RowFixed } from 'components/Row'
import { PositionInOverview } from 'data/dashboard/overviewData'
import useTheme from 'hooks/useTheme'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { ExternalLink, TYPE } from 'theme'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { DAI, USDC, USDT } from '../../../../constants'
import { ExplorerDataType, getExplorerLink } from '../../../../utils/getExplorerLink'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  // align-items: center;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`
const FirstRow = styled(Row)`
  margin-bottom: 10px;
  align-items: center;
`
const SecondRow = styled(Row)`
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
  ${({ theme }) => theme.mediaWidth.upToMedium`
  min-height: max-content;
  margin: 4px 0;
  `};
`

const PriceCardWrapper = styled(FirstRowCard)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 160px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  max-width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  `};
`

const PriceNumber = styled.div`
  overflow: hidden;
  textoverflow: ellipsis;
  maxwidth: 160px;
  color: ${({ theme }) => theme.text3};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  font-size: ${({ theme }) => theme.fontSize.h3};
  margin: 6px 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin: 0 6px 0 2px;
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const NameAndStatus = styled.div`
  display: flex;
  flex-grow: 1;
  padding-left: 5px;
  font-size: ${({ theme }) => theme.fontSize.h3};
  align-items: center;
`
const RateToggleButton = styled.button`
  margin-right: 30px;
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  border-radius: 10px;
  width: 120px;
  outline: none;
  border: none;
  padding: 8px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-right: 0px;
  `};
`

const RateToggleButtonDesktop = styled(RateToggleButton)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: none;
  `};
`

const RateToggleButtonMobile = styled(RateToggleButton)`
  display: none;
  align-self: flex-end;
  margin-top: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
display: flex;
`}
`

const SwitchIcon = styled(Icon)`
  margin-left: 6px;
`
const ExpandButton = styled(ButtonSecondary)``

const ExpandButtonDesktop = styled(ExpandButton)`
  width: 160px;
  padding: 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: none;
  `}
`

const ExpandButtonMobile = styled(ExpandButton)`
  display: none;
  align-self: flex-end;
  margin-top: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: flex;
  `}
`

const ExpandIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  margin-top: 2px;
`
const PoolLogoWrapper = styled.div``

const Name = styled.div`
  display: flex;
  align-items: center;
`
const PoolName = styled.div`
  margin-right: 10px;
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
`
const ExtentsText = styled.span`
  color: ${({ theme }) => theme.text2};
  font-size: 14px;
  text-align: center;
  margin-right: 4px;
  font-weight: 500;
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

const PositionIDLink = styled.a`
  text-decoration: none;
`

export function getPriceOrderingFromPositionForUI(
  position?: PositionInOverview
): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} {
  if (!position) {
    return {}
  }

  const token0 = position.amount0.currency
  const token1 = position.amount1.currency

  // if token0 is a dollar-stable asset, set it as the quote token
  const stables = [DAI, USDC, USDT]
  if (stables.some((stable) => stable.equals(token0))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  }
}

function getRatio(lower: Price<Token, Token>, current: Price<Token, Token>, upper: Price<Token, Token>) {
  try {
    if (!current.greaterThan(lower)) {
      return 100
    } else if (!current.lessThan(upper)) {
      return 0
    }

    const a = Number.parseFloat(lower.toSignificant(15))
    const b = Number.parseFloat(upper.toSignificant(15))
    const c = Number.parseFloat(current.toSignificant(15))

    const ratio = Math.floor((1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100)

    if (ratio < 0 || ratio > 100) {
      throw Error('Out of range')
    }

    return ratio
  } catch {
    return undefined
  }
}

function PriceCard({
  title,
  price,
  currencyQuote,
  currencyBase,
}: {
  title: string
  price?: any
  currencyQuote?: Token
  currencyBase?: Token
}) {
  if (!currencyQuote || !currencyBase) {
    return null
  }

  return (
    <PriceCardWrapper>
      <ExtentsText>{title}</ExtentsText>
      <PriceNumber>{price}</PriceNumber>
      <ExtentsText>
        {currencyQuote?.symbol} per {currencyBase?.symbol}
      </ExtentsText>
    </PriceCardWrapper>
  )
}

function LiquidityCard({
  position,
  chainId,
  ratio,
}: {
  position: PositionInOverview
  chainId: number
  ratio?: number
}) {
  const theme = useTheme()
  const { token0, token1 } = position.pool
  return (
    <FirstRowCard>
      <AutoColumn gap="md">
        <RowBetween>
          <Label>Liquidity:</Label>
          {formatDollarAmount(position.liquidityUSD)}
        </RowBetween>
        <RowBetween>
          <ExternalLink href={getExplorerLink(chainId, token0.address, ExplorerDataType.ADDRESS)}>
            <RowFixed>
              {/* <CurrencyLogo address={token0.address} size="18px" style={{ marginRight: '0.5rem' }} /> */}
              <TYPE.main>{token0.symbol} ↗</TYPE.main>
            </RowFixed>
          </ExternalLink>
          <TYPE.main>
            {position.amount0.toSignificant(4)}
            {typeof ratio === 'number' && position.liquidityUSD !== 0 ? (
              <Badge style={{ marginLeft: '10px' }}>
                <TYPE.main color={theme.text2} fontSize={11}>
                  {ratio}%
                </TYPE.main>
              </Badge>
            ) : null}
          </TYPE.main>
        </RowBetween>
        <RowBetween>
          <ExternalLink href={getExplorerLink(chainId, token1.address, ExplorerDataType.ADDRESS)}>
            <RowFixed>
              {/* <CurrencyLogo address={token1.address} size="18px" style={{ marginRight: '0.5rem' }} /> */}
              <TYPE.main>{token1.symbol} ↗</TYPE.main>
            </RowFixed>
          </ExternalLink>
          <TYPE.main>
            {position.amount1.toSignificant(4)}
            {typeof ratio === 'number' && position.liquidityUSD !== 0 ? (
              <Badge style={{ marginLeft: '10px' }}>
                <TYPE.main color={theme.text2} fontSize={11}>
                  {100 - ratio}%
                </TYPE.main>
              </Badge>
            ) : null}
          </TYPE.main>
        </RowBetween>
      </AutoColumn>
    </FirstRowCard>
  )
}

function FeesCard({
  title,
  feesUSD,
  feesToken0,
  feesToken1,
  token0,
  token1,
}: {
  title: string
  feesUSD: number
  feesToken0: number
  feesToken1: number
  token0: Token
  token1: Token
}) {
  const theme = useTheme()
  return (
    <FirstRowCard>
      <AutoColumn gap="md">
        <RowBetween>
          <Label>{title}:</Label>
          {feesUSD > 0 ? <div style={{ color: theme.green1 }}>{formatDollarAmount(feesUSD)}</div> : '-'}{' '}
        </RowBetween>
        <RowBetween>
          <RowFixed>
            {/* <CurrencyLogo address={token0.address} size="18px" style={{ marginRight: '0.5rem' }} /> */}
            <TYPE.main>{token0.symbol}</TYPE.main>
          </RowFixed>
          <TYPE.main>{feesToken0 ? formatAmount(feesToken0) : '-'}</TYPE.main>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            {/* <CurrencyLogo address={token1.address} size="18px" style={{ marginRight: '0.5rem' }} /> */}
            <TYPE.main>{token1.symbol}</TYPE.main>
          </RowFixed>
          <TYPE.main>{feesToken1 ? formatAmount(feesToken1) : '-'}</TYPE.main>
        </RowBetween>
      </AutoColumn>
    </FirstRowCard>
  )
}

interface Props {
  position: PositionInOverview
  positionIndex: number
  isExpanded: boolean
  handleShowExpanded: () => void
}

const PositionOverview = ({ position, isExpanded, handleShowExpanded }: Props) => {
  const theme = useTheme()
  const { pool, tickLower, tickUpper, tokenId } = position
  const { token0, token1, fee } = position.pool

  let { priceLower, priceUpper, base, quote } = getPriceOrderingFromPositionForUI(position)
  const [manuallyInverted, setManuallyInverted] = useState(false)
  // handle manual inversion
  if (manuallyInverted) {
    ;[priceLower, priceUpper, base, quote] = [priceUpper?.invert(), priceLower?.invert(), quote, base]
  }
  const inverted = token1 ? base?.equals(position.pool.token1) : undefined
  const currencyQuote = inverted ? token0 : token1
  const currencyBase = inverted ? token1 : token0

  // check if price is within range
  const below = pool && typeof tickLower === 'number' ? pool.tickCurrent < tickLower : undefined
  const above = pool && typeof tickUpper === 'number' ? pool.tickCurrent >= tickUpper : undefined
  const inRange: boolean = typeof below === 'boolean' && typeof above === 'boolean' ? !below && !above : false

  // check if position is removed
  const removed = position.liquidityUSD === 0

  // get liqudiity ratio
  const ratio = useMemo(() => {
    return priceLower && pool && priceUpper
      ? getRatio(
          inverted ? priceUpper.invert() : priceLower,
          pool.token0Price,
          inverted ? priceLower.invert() : priceUpper
        )
      : undefined
  }, [inverted, pool, priceLower, priceUpper])

  return (
    <Wrapper>
      <FirstRow>
        <NameAndStatus>
          <Name>
            {/* #{positionIndex} */}
            <PoolLogoWrapper>
              <DoubleCurrencyLogo address0={token0.address} address1={token1.address} size={20} margin={true} />
            </PoolLogoWrapper>
            <PoolName>{`${token0.symbol} / ${token1.symbol}`}</PoolName>
            <Badge style={{ marginRight: '8px' }}>
              <BadgeText>{new Percent(fee, 1_000_000).toSignificant()}%</BadgeText>
            </Badge>
          </Name>
          <PositionIDLink href={`https://app.uniswap.org/#/pool/${tokenId}`} target="_blank" rel="noreferrer noopener">
            <Badge style={{ marginRight: '8px' }}>
              <BadgeText>{`ID: ${tokenId}`}</BadgeText>
            </Badge>
          </PositionIDLink>
          <RangeBadge removed={removed} inRange={inRange} />
        </NameAndStatus>
        {currencyBase && currencyQuote && (
          <RateToggleButtonDesktop onClick={() => setManuallyInverted(!manuallyInverted)}>
            Switch price
            <SwitchIcon icon="SWITCH" color={theme.text3} size={14} />
          </RateToggleButtonDesktop>
        )}
        <ExpandButtonDesktop onClick={() => handleShowExpanded()}>
          {isExpanded ? 'Show Less' : 'Show More'}
          <ExpandIconWrapper>
            <Icon icon={isExpanded ? 'ARROW_UP' : 'ARROW_DOWN'} size={20} color={theme.primary1} />
          </ExpandIconWrapper>
        </ExpandButtonDesktop>
      </FirstRow>
      <SecondRow>
        <LiquidityCard chainId={1} position={position} ratio={ratio} />
        <FeesCard
          title="Unclaimed Fees"
          feesUSD={position.uncollectedFeesUSD || 0}
          feesToken0={position.uncollectedFeesToken0 || 0}
          feesToken1={position.uncollectedFeesToken1 || 0}
          token0={token0}
          token1={token1}
        />
        <PriceCard
          title="Min Price"
          price={priceLower?.toSignificant(5)}
          currencyBase={currencyBase}
          currencyQuote={currencyQuote}
        />
        <PriceCard
          title="Max price"
          price={priceUpper?.toSignificant(5)}
          currencyBase={currencyBase}
          currencyQuote={currencyQuote}
        />
        <PriceCard
          title="Current price"
          price={(inverted ? pool.token1Price : pool.token0Price).toSignificant(6)}
          currencyBase={currencyBase}
          currencyQuote={currencyQuote}
        />
      </SecondRow>
      {currencyBase && currencyQuote && (
        <RateToggleButtonMobile onClick={() => setManuallyInverted(!manuallyInverted)}>
          Switch price
          <SwitchIcon icon="SWITCH" color={theme.text3} size={14} />
        </RateToggleButtonMobile>
      )}
      <ExpandButtonMobile onClick={() => handleShowExpanded()}>
        {isExpanded ? 'Show Less' : 'Show More'}
        <ExpandIconWrapper>
          <Icon icon={isExpanded ? 'ARROW_UP' : 'ARROW_DOWN'} size={20} color={theme.primary1} />
        </ExpandIconWrapper>
      </ExpandButtonMobile>
    </Wrapper>
  )
}

export default PositionOverview
