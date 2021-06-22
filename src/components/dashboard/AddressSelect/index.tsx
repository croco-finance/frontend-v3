import Icon from 'components/Icon'
import Select from 'components/Select'
import useTheme from 'hooks/useTheme'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { useDashboardAddresses } from 'state/dashboard/hooks'
import styled from 'styled-components'
import { DashboardState } from 'state/dashboard/reducer'
import { useModalOpen, useDashboardAddressesModalToggle } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/actions'
import AddressModal from '../ManageAddessesModal'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ManageAddressesButton = styled.button`
  border: none;
  padding: 12px 15px;
  border-radius: 10px;
  margin-left: 10px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.bg3};

  &:focus {
    border: none;
    outline: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg4};
  }
`

const buildAddressOption = (address: string, ens: string): AddressOption => ({
  value: address,
  label: ens || address,
})

const buildAddressOptions = (addresses: any) => {
  if (!addresses) return null

  let numberOfBundled = 0
  const options: AddressOption[] = []

  // get how many bundled addresses there are
  Object.keys(addresses).forEach((address) => {
    // addresses are 0xabc, 0xefg, ... and "bundled".
    if (address !== 'bundled') {
      const { bundled, ens } = addresses[address]

      // check if the address has bundled tag
      if (bundled) numberOfBundled += 1

      // push address option
      options.push(buildAddressOption(address, ens))
    }
  })

  // add bundled option if more than 1 bundled addresses is present
  if (numberOfBundled > 1) {
    options.push({
      value: 'bundled',
      label: `Bundled Wallets (${numberOfBundled})`,
    })
  }

  return options
}

const getBundledAddresses = (addresses: DashboardState['userAddresses']): string[] => {
  const addressesArr: string[] = []

  Object.keys(addresses).forEach((address) => {
    if (addresses[address].bundled) addressesArr.push(address)
  })

  return addressesArr
}

interface AddressOption {
  value: string | 'bundled'
  label: string
}

interface Props {
  onAddressChange?: any
}

const AddressSelect = ({ onAddressChange }: Props) => {
  const theme = useTheme()
  const history = useHistory()
  const userAddresses = useDashboardAddresses()
  const addressesModalOpen = useModalOpen(ApplicationModal.DASHBOARD_ADDRESSES)
  const toggleAddressesModal = useDashboardAddressesModalToggle()

  const handleNav = (address: string) => {
    if (address === 'bundled') {
      const addresses = getBundledAddresses(userAddresses).join('+')
      history.push('/dashboard/' + addresses)
    } else {
      history.push('/dashboard/' + address)
    }
  }

  return (
    <Wrapper>
      <Select
        options={buildAddressOptions(userAddresses)}
        onChange={(option: AddressOption) => {
          handleNav(option.value)
        }}
        placeholder="Select your Ethereum address..."
        isSearchable={false}
      />

      <ManageAddressesButton onClick={toggleAddressesModal}>
        <Icon icon="SETTINGS" size={20} color={theme.text1} />
      </ManageAddressesButton>
      <AddressModal />
    </Wrapper>
  )
}

export default AddressSelect
