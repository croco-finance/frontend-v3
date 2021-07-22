import { SavedIcon } from 'components/Button'
import { GreyBadge } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import HoverInlineText from 'components/HoverInlineText'
import Row, { RowFixed } from 'components/Row'
import { useFetchSearchResults } from 'data/search'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Hotkeys from 'react-hot-keys'
import { useHistory } from 'react-router-dom'
import { usePoolDatas } from 'state/pools/hooks'
import { useSavedPools } from 'state/user/hooks'
import styled from 'styled-components'
import { HideSmall, TYPE } from 'theme'
import { feeTierPercent } from 'utils'
import { formatDollarAmount } from 'utils/numbers'
import { POOL_HIDE } from '../../../constants/index'

const Container = styled.div`
  position: relative;
  z-index: 30;
  width: 100%;
`

const Wrapper = styled(Row)`
  background-color: ${({ theme }) => theme.black};
  padding: 10px 16px;
  width: 100%;
  height: 44px;
  border-radius: 20px;
  positon: relative;
  z-index: 9999;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
  `};
`

const StyledInput = styled.input`
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: none;
  border: none;
  width: 100%;
  font-size: 16px;
  outline: none;
  color: ${({ theme }) => theme.text1};

  ::placeholder {
    color: ${({ theme }) => theme.text3};
    font-size: 16px;
  }

  @media screen and (max-width: 640px) {
    ::placeholder {
      font-size: 1rem;
    }
  }
`

const Menu = styled.div<{ hide: boolean }>`
  display: flex;
  flex-direction: column;
  z-index: 9999;
  width: 640px;
  top: 50px;
  max-height: 600px;
  overflow: auto;
  left: 0;
  padding: 1.5rem;
  padding-bottom: 1.5rem;
  position: absolute;
  background: ${({ theme }) => theme.bg0};
  border-radius: 8px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.04);
  display: ${({ hide }) => hide && 'none'};
  border: 1px solid ${({ theme }) => theme.blue1};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 520px;
    max-height: 400px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 340px;
  `};
`

const Blackout = styled.div`
  position: fixed;
  z-index: 30;
  background-color: black;
  opacity: 0.7;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1.5fr repeat(2, 1fr);
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};
`

const HoverText = styled.div<{ hide?: boolean | undefined }>`
  color: ${({ theme }) => theme.blue1}
  display: ${({ hide = false }) => hide && 'none'};
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const HoverRowLink = styled.div`
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const OptionButton = styled.div<{ enabled: boolean }>`
  width: fit-content;
  padding: 4px 8px;
  border-radius: 8px;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  margin-right: 10px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, enabled }) => (enabled ? theme.green1 : 'transparent')};
  color: ${({ theme, enabled }) => (enabled ? theme.white : theme.green1)};
  :hover {
    opacity: 0.6;
    cursor: pointer;
  }
`

const PoolSelect = ({ ...rest }) => {
  const history = useHistory()

  const ref = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const handleDown = useCallback(() => {
    if (ref != null && ref.current !== null) {
      ref.current.focus()
    }
  }, [])

  const [focused, setFocused] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useState(false)
  const [value, setValue] = useState('')

  const { pools } = useFetchSearchResults(value)

  useEffect(() => {
    if (value !== '') {
      setFocused(true)
    } else {
      setFocused(false)
    }
  }, [value])

  const [poolsShown, setPoolsShown] = useState(3)

  const handleClick = (e: any) => {
    if (!(menuRef.current && menuRef.current.contains(e.target)) && !(ref.current && ref.current.contains(e.target))) {
      setPoolsShown(3)
      setShowMenu(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  })

  // watchlist
  const [savedPools, addSavedPool] = useSavedPools()

  const handleNav = (to: string) => {
    setShowMenu(false)
    setPoolsShown(3)
    history.push(to)
  }

  // get date for watchlist
  const watchListPoolData = usePoolDatas(savedPools)

  // filter on view
  const [showWatchlist, setShowWatchlist] = useState(false)

  const poolForList = useMemo(() => (showWatchlist ? watchListPoolData ?? [] : pools), [
    pools,
    showWatchlist,
    watchListPoolData,
  ])

  return (
    <Hotkeys keyName="command+/" onKeyDown={handleDown}>
      {showMenu ? <Blackout /> : null}
      <Container>
        <Wrapper {...rest}>
          <StyledInput
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
            }}
            placeholder="Search pools"
            ref={ref}
            onFocus={() => {
              setFocused(true)
              setShowMenu(true)
            }}
            onBlur={() => setFocused(false)}
          />
          {!focused && <TYPE.gray pl="2px">⌘/</TYPE.gray>}
        </Wrapper>
        <Menu hide={!showMenu} ref={menuRef}>
          <AutoColumn gap="lg">
            <AutoColumn gap="sm">
              <RowFixed>
                <OptionButton enabled={!showWatchlist} onClick={() => setShowWatchlist(false)}>
                  Search
                </OptionButton>
                <OptionButton enabled={showWatchlist} onClick={() => setShowWatchlist(true)}>
                  Watchlist
                </OptionButton>
              </RowFixed>
            </AutoColumn>

            <ResponsiveGrid>
              <TYPE.main>Pools</TYPE.main>
              <HideSmall>
                <TYPE.main textAlign="end" fontSize="12px">
                  Volume 24H
                </TYPE.main>
              </HideSmall>
              <HideSmall>
                <TYPE.main textAlign="end" fontSize="12px">
                  TVL
                </TYPE.main>
              </HideSmall>
              <HideSmall>
                {/* <TYPE.main textAlign="end" fontSize="12px">
                  Price
                </TYPE.main> */}
              </HideSmall>
            </ResponsiveGrid>
            {poolForList
              .filter((p) => !POOL_HIDE.includes(p.address))
              .slice(0, poolsShown)
              .map((p, i) => {
                return (
                  <HoverRowLink onClick={() => handleNav('/simulator/' + p.address)} key={i}>
                    <ResponsiveGrid key={i}>
                      <RowFixed>
                        <DoubleCurrencyLogo address0={p.token0.address} address1={p.token1.address} />
                        <TYPE.label ml="10px" style={{ whiteSpace: 'nowrap' }}>
                          <HoverInlineText maxCharacters={12} text={`${p.token0.symbol} / ${p.token1.symbol}`} />
                        </TYPE.label>
                        <GreyBadge ml="10px">{feeTierPercent(p.feeTier)}</GreyBadge>
                        <SavedIcon
                          id="watchlist-icon"
                          size={'16px'}
                          style={{ marginLeft: '10px' }}
                          fill={savedPools.includes(p.address)}
                          onClick={(e) => {
                            e.stopPropagation()
                            addSavedPool(p.address)
                          }}
                        />
                      </RowFixed>
                      <HideSmall>
                        <TYPE.label textAlign="end">{formatDollarAmount(p.volumeUSD)}</TYPE.label>
                      </HideSmall>
                      <HideSmall>
                        <TYPE.label textAlign="end">{formatDollarAmount(p.tvlUSD)}</TYPE.label>
                      </HideSmall>
                      {/* <HideSmall>
                        <TYPE.label textAlign="end">{formatDollarAmount(p.token0Price)}</TYPE.label>
                      </HideSmall> */}
                    </ResponsiveGrid>
                  </HoverRowLink>
                )
              })}
            {poolForList.length === 0 ? (
              <TYPE.main>{showWatchlist ? 'Saved pools will appear here' : 'No results'}</TYPE.main>
            ) : null}
            <HoverText
              onClick={() => {
                setPoolsShown(poolsShown + 5)
              }}
              hide={!(poolForList.length > 3 && poolForList.length >= poolsShown)}
              ref={textRef}
            >
              See more...
            </HoverText>
          </AutoColumn>
        </Menu>
        {/* <BelowMedium>
          <MobileMenu>hey</MobileMenu>
        </BelowMedium> */}
      </Container>
    </Hotkeys>
  )
}

export default PoolSelect
