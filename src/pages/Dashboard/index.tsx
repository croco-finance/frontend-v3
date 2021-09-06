import { ButtonGray } from 'components/Button'
import { DarkCard } from 'components/Card'
import AddressSelect from 'components/dashboard/AddressSelect'
import FirstAddressInput from 'components/dashboard/FirstAddressInput'
import PoolSelect, { PoolOption } from 'components/dashboard/PoolSelect'
import PositionsList from 'components/dashboard/PositionsList'
import Icon from 'components/Icon'
import Loader from 'components/Loader'
import { useColor } from 'hooks/useColor'
import useTheme from 'hooks/useTheme'
import { PageWrapper, ThemedBackground } from 'pages/styled'
import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useDashboardAddressesModalToggle } from 'state/application/hooks'
import { usePositionDatas } from 'state/dashboard/hooks'
import { PositionData } from 'state/dashboard/reducer'
import { useWatchedAddresses } from 'state/user/hooks'
import { UserState } from 'state/user/reducer'
import styled from 'styled-components'
import { isAddress } from 'utils'

const Header = styled(DarkCard)`
  display: flex;
  margin-bottom: 44px;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `};
`

const Content = styled.div``

const OpenAddressModalButton = styled(ButtonGray)`
  width: 48px;
  height: 48px;
  margin-left: 16px;
  align-self: flex-end;
`
const InputLabel = styled.div`
  color: ${({ theme }) => theme.text3};
  padding-left: 10px;
  margin-bottom: 5px;
`

const AddressSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  // align-items: center;
  width: 50%;
  margin-right: 16px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  margin-bottom: 10px;
  margin-right: 0;
  `};
`

const FirstAddressWrapper = styled(AddressSelectWrapper)`
  margin-right: 0;
  width: 100%;
  max-width: 640px;
`

const PoolSelectWrapper = styled(AddressSelectWrapper)`
  margin-right: 0;
`

const NoPositionsFound = styled.div`
  color: ${({ theme }) => theme.warning};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  font-size: ${({ theme }) => theme.fontSize.normal}
  text-align: center;
`

const getFilteredPositions = (
  positions: PositionData[] | undefined,
  poolOption: PoolOption
): PositionData[] | undefined => {
  if (!positions) return undefined
  // return all positions
  if (poolOption.value === 'all') return positions

  // filter positions based on poolOption
  const { feeTier: searchedFeeTier, pool: searchedPool } = poolOption.value
  return positions.filter(
    (position) => position.overview.poolAddress === searchedPool && position.overview.pool.fee === searchedFeeTier
  )
}

const getBundledAddresses = (addresses: UserState['watchedAddresses']): string[] => {
  if (!addresses) return []
  const addressesArr: string[] = []

  Object.keys(addresses).forEach((address) => {
    if (addresses[address].bundled) addressesArr.push(address)
  })

  return addressesArr
}

const Dashboard = ({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  // theming
  const theme = useTheme()
  const backgroundColor = useColor(address)
  const toggleAddressesModal = useDashboardAddressesModalToggle()
  const watchedAddresses = useWatchedAddresses()

  // based on value of poolSelected we will fiter pools rendered to user
  const [poolSelected, setPoolSelected] = useState<PoolOption>({ value: 'all', label: 'All pools' })

  useEffect(() => {
    setPoolSelected({ value: 'all', label: 'All pools' })
  }, [address])

  // get for which adddresses to fetch positions
  let ownersToUse: string[] | undefined

  if (address && isAddress(address)) {
    ownersToUse = [address]
  } else {
    // address is not defined. Use bundled waller or none
    const bundledAddress = getBundledAddresses(watchedAddresses)
    if (bundledAddress.length > 0) {
      ownersToUse = bundledAddress
    } else {
      ownersToUse = undefined
    }
  }
  // get positions for selected owners
  const { data: positions, latestUpdate } = usePositionDatas(ownersToUse)

  // todo get array of all positions assigned to those addresses
  const handlePoolSelect = (option: PoolOption) => {
    setPoolSelected(option)
  }

  // filter positions based on the selected pool option
  const poolFilteredPositions = getFilteredPositions(positions, poolSelected)

  // get positions that are active, out of range or in range
  const positionsInRange = poolFilteredPositions
    ? poolFilteredPositions.filter(
        (p: any) =>
          p.overview.pool.tickCurrent < p.overview.tickUpper &&
          p.overview.pool.tickCurrent > p.overview.tickLower &&
          p.overview.liquidityUSD > 0
      )
    : []
  const positionsOutOfRange = poolFilteredPositions
    ? poolFilteredPositions.filter(
        (p: any) =>
          (p.overview.pool.tickCurrent < p.overview.tickLower || p.overview.pool.tickCurrent > p.overview.tickUpper) &&
          p.overview.liquidityUSD > 0
      )
    : []
  const positionsClosed = poolFilteredPositions
    ? poolFilteredPositions.filter((p: any) => p.overview.liquidityUSD === 0)
    : []

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <Header>
        {!watchedAddresses || Object.keys(watchedAddresses).length < 1 ? (
          <FirstAddressWrapper>
            <FirstAddressInput />
          </FirstAddressWrapper>
        ) : (
          <>
            <AddressSelectWrapper>
              <InputLabel>Ethereum Address</InputLabel>
              <AddressSelect urlAddress={address} />
            </AddressSelectWrapper>
            <PoolSelectWrapper>
              <InputLabel>Filter by pool</InputLabel>
              <PoolSelect
                value={poolSelected}
                positions={positions}
                onPoolSelect={(option: PoolOption) => {
                  handlePoolSelect(option)
                }}
              />
            </PoolSelectWrapper>
            <OpenAddressModalButton onClick={toggleAddressesModal}>
              <Icon icon="SETTINGS" size={20} color={theme.text1} />
            </OpenAddressModalButton>
          </>
        )}
      </Header>
      <Content>
        {ownersToUse && positions && positions?.length < 1 && latestUpdate ? (
          <NoPositionsFound>
            {"We didn't find any positions associated with this address (we scan only for Uniswap v3 positions)"}
          </NoPositionsFound>
        ) : null}
        {!positions && ownersToUse && !latestUpdate ? (
          <Loader />
        ) : (
          <>
            <PositionsList positions={positionsInRange} />
            <PositionsList positions={positionsOutOfRange} />
            <PositionsList positions={positionsClosed} />
          </>
        )}
      </Content>
    </PageWrapper>
  )
}

export default Dashboard
