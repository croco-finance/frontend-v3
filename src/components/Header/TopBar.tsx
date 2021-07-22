import Icon from 'components/Icon'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { useEthPrices } from 'hooks/useEthPrices'
import React from 'react'
import styled from 'styled-components'
import { ExternalLink, TYPE } from 'theme'
import { formatDollarAmount } from 'utils/numbers'
import { DISCORD_LINK, TELEGRAM_LINK, TWITTER_LINK } from '../../constants'
import Polling from './Polling'

const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.black};
  padding: 10px 20px;
`

const Item = styled(TYPE.main)`
  font-size: 12px;
`

const StyledLink = styled(ExternalLink)`
  font-size: 12px;
  color: ${({ theme }) => theme.text1};
`

const IconLinkWrapper = styled.a`
  text-decoration: none;
  cursor: pointer;
  margin: 0 10px !important;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: none;
  }

  &:nth-child(3) {
    margin-right: 20px !important;
  }
`

const TopBar = () => {
  const ethPrices = useEthPrices()

  return (
    <Wrapper>
      <RowBetween>
        <Polling />
        <AutoRow gap="6px">
          <RowFixed>
            <Item>ETH Price:</Item>
            <Item fontWeight="700" ml="4px">
              {formatDollarAmount(ethPrices?.current)}
            </Item>
          </RowFixed>
        </AutoRow>
        <AutoRow gap="6px" style={{ justifyContent: 'flex-end' }}>
          <IconLinkWrapper rel="noreferrer" target="_blank" href={TWITTER_LINK}>
            <Icon icon="TWITTER" size={16} />
          </IconLinkWrapper>
          <IconLinkWrapper rel="noreferrer" target="_blank" href={DISCORD_LINK}>
            <Icon icon="DISCORD" size={16} />
          </IconLinkWrapper>
          <IconLinkWrapper rel="noreferrer" target="_blank" href={TELEGRAM_LINK}>
            <Icon icon="TELEGRAM" size={16} />
          </IconLinkWrapper>

          {/* <StyledLink href="https://v2.info.uniswap.org/#/">V2 Analytics</StyledLink> */}
          {/* <StyledLink href="https://docs.uniswap.org/">Uniswap Docs</StyledLink> */}
          <StyledLink href="https://app.uniswap.org/#/swap">Swap Tokens</StyledLink>
        </AutoRow>
      </RowBetween>
    </Wrapper>
  )
}

export default TopBar
