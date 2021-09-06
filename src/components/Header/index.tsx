/* eslint-disable @typescript-eslint/no-var-requires */
// import { ChainId } from '@uniswap/sdk'
import Icon from 'components/Icon'
// import Web3Status from '../Web3Status'
import SearchSmall from 'components/Search'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import React, { useState } from 'react'
// import { Text } from 'rebass'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import { useLayoutSize } from 'state/application/hooks'
import styled from 'styled-components'
import { isAddress } from 'utils'
// import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/croco_uni_logo_dark.svg'

const NAVBAR_HEIGHT = '50px'

const Navbar = styled.div`
  padding: 4px 0;
`

const NavBarContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`

const NavItems = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 0%;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  flex-direction: column;
  flex: 1 1 0%;
  `};
`

const HamburgerIcon = styled(Icon)`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`

const MobileMenuWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  top: ${NAVBAR_HEIGHT};
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  z-index: 999;
  overflow-y: hidden;
  background-color: ${({ theme }) => theme.bg0};
`

// ****************************** */

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  background-color: ${({ theme }) => theme.bg0};

  @media only screen and (max-width: 1060px) {
    grid-template-columns: 1fr;
    padding: 1rem 1rem 0.5rem 1rem;
    width: calc(100%);
    position: relative;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      padding-top: 0.5rem;
      width: 100%;
  `};
`

// const HeaderElement = styled.div`
//   display: flex;
//   align-items: center;

//   /* addresses safari's lack of support for "gap" */
//   & > *:not(:first-child) {
//     margin-left: 8px;
//   }

//   ${({ theme }) => theme.mediaWidth.upToMedium`
//    flex-direction: row-reverse;
//     align-items: center;
//   `};
// `

// const AccountElement = styled.div<{ active: boolean }>`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   background-color: ${({ theme, active }) => (!active ? theme.bg0 : theme.bg1)};
//   border-radius: 12px;
//   white-space: nowrap;
//   width: 100%;
//   cursor: pointer;

//   :focus {
//     border: 1px solid blue;
//   }
// `

// const HideSmall = styled.span`
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     display: none;
//   `};
// `

// const NetworkCard = styled(YellowCard)`
//   border-radius: 12px;
//   padding: 8px 12px;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     margin: 0;
//     margin-right: 0.5rem;
//     width: initial;
//     overflow: hidden;
//     text-overflow: ellipsis;
//     flex-shrink: 1;
//   `};
// `

// const BalanceText = styled(Text)`
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     display: none;
//   `};
// `

const Title = styled(NavLink)`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 12px;
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 1rem;
  width: fit-content;
  margin: 0 6px;
  padding: 8px 12px;
  font-weight: 500;

  &.${activeClassName} {
    border-radius: 12px;
    background-color: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  margin: 4px;
 `}
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

// const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
//   [ChainId.RINKEBY]: 'Rinkeby',
//   [ChainId.ROPSTEN]: 'Ropsten',
//   [ChainId.GÖRLI]: 'Görli',
//   [ChainId.KOVAN]: 'Kovan',
// }

export default function Header(props: RouteComponentProps) {
  const theme = useTheme()
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false)
  const { layoutSize } = useLayoutSize()
  const isMobileLayout = layoutSize === 'TINY'

  // const { account, chainId } = useActiveWeb3React()

  // const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  // const [isDark] = useDarkModeManager()
  // const [darkMode, toggleDarkMode] = useDarkModeManager()

  const navBar = (
    <Navbar>
      <NavBarContent>
        <Title
          to="/"
          onClick={() => {
            setMobileMenuOpened(false)
          }}
        >
          <UniIcon>
            <img width={'48px'} src={LogoDark} alt="logo" />
          </UniIcon>
        </Title>

        {/* On mobile layout show hamburger menu, otherwise navigation items */}
        {isMobileLayout ? (
          <HamburgerIcon
            icon={mobileMenuOpened ? 'CLOSE' : 'HAMBURGER_MENU'}
            size={mobileMenuOpened ? 20 : 26}
            color={theme.text1}
            onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
          />
        ) : (
          <NavItems>
            <StyledNavLink id={`stake-nav-link`} to={'/positions'}>
              My Positions
            </StyledNavLink>
            <StyledNavLink id={`pool-nav-link`} to={'/overview'}>
              Overview
            </StyledNavLink>
            {/* <StyledNavLink id={`swap-nav-link`} to={'/protocol'}>
            Protocol
          </StyledNavLink> */}
            <StyledNavLink id={`stake-nav-link`} to={'/pools'}>
              Pools
            </StyledNavLink>
            <StyledNavLink id={`stake-nav-link`} to={'/tokens'}>
              Tokens
            </StyledNavLink>
            <StyledNavLink
              id={`stake-nav-link`}
              to={({ pathname }) => {
                const splitted = pathname.split('/')
                // if the user wa previsously on poolPage and now clicks on simulator. Redirect him to the same pool
                // splitted[0] is empty string and splitted[2] is pool address
                if (splitted[1] === 'pools' && splitted[2] && isAddress(splitted[2])) return `/simulator/${splitted[2]}`
                return '/simulator'
              }}
            >
              Simulator
            </StyledNavLink>
          </NavItems>
        )}
      </NavBarContent>
    </Navbar>
  )

  const mobileMenu = (
    <MobileMenuWrapper>
      <NavItems>
        <StyledNavLink
          id={`stake-nav-link`}
          to={'/positions'}
          onClick={() => {
            setMobileMenuOpened(false)
          }}
        >
          My Positions
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/overview'}
            onClick={() => {
              setMobileMenuOpened(false)
            }}
          >
            Overview
          </StyledNavLink>
          {/* <StyledNavLink id={`swap-nav-link`} to={'/protocol'}>
            Protocol
          </StyledNavLink> */}
          <StyledNavLink
            id={`stake-nav-link`}
            to={'/pools'}
            onClick={() => {
              setMobileMenuOpened(false)
            }}
          >
            Pools
          </StyledNavLink>
          <StyledNavLink
            id={`stake-nav-link`}
            to={'/tokens'}
            onClick={() => {
              setMobileMenuOpened(false)
            }}
          >
            Tokens
          </StyledNavLink>
        </StyledNavLink>
        <StyledNavLink
          id={`stake-nav-link`}
          to={({ pathname }) => {
            const splitted = pathname.split('/')
            // if the user wa previsously on poolPage and now clicks on simulator. Redirect him to the same pool
            // splitted[0] is empty string and splitted[2] is pool address
            if (splitted[1] === 'pools' && splitted[2] && isAddress(splitted[2])) return `/simulator/${splitted[2]}`
            return '/simulator'
          }}
          onClick={() => {
            setMobileMenuOpened(false)
          }}
        >
          Simulator
        </StyledNavLink>
      </NavItems>
    </MobileMenuWrapper>
  )

  return (
    <HeaderFrame>
      {navBar}

      {/* Mobile menu */}
      {mobileMenuOpened && isMobileLayout && mobileMenu}
      <HeaderControls>
        {!props.location.pathname.includes('simulator') && !props.location.pathname.includes('dashboard') && (
          <SearchSmall />
        )}
        {/* <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} ETH
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement> */}
        {/* <HideMedium>
          <HeaderElementWrap>
            <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
            <Menu />
          </HeaderElementWrap>
        </HideMedium> */}
      </HeaderControls>
    </HeaderFrame>
  )
}
