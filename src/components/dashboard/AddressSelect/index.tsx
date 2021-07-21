import Select from 'components/Select'
import useTheme from 'hooks/useTheme'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useWatchedAddresses } from 'state/user/hooks'
import { UserState } from 'state/user/reducer'
import styled from 'styled-components'
import { isAddress } from 'utils'
import AddressModal from '../ManageAddessesModal'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`
const buildAddressOption = (address: string, ens: string): AddressOption => ({
  value: address,
  label: ens || address,
})

const buildAddressOptions = (addresses: UserState['watchedAddresses']) => {
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

const getBundledAddresses = (addresses: UserState['watchedAddresses'] | null): string[] => {
  if (!addresses) return []
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
  urlAddress: string
}
const AddressSelect = ({ urlAddress }: Props) => {
  const history = useHistory()
  const watchedAddresses = useWatchedAddresses()

  const handleNav = (address: string) => {
    if (address === 'bundled') {
      history.push('/positions')
    } else {
      history.push('/positions/' + address)
    }
  }

  const getSelectedOption = (options: AddressOption[] | null, address: string) => {
    if (!options) return null
    if (!address) {
      const bundledAddresses = getBundledAddresses(watchedAddresses)
      // if there are some bundled addresses
      if (bundledAddresses.length > 0) {
        return options?.filter((o) => o.value === 'bundled')
      } else {
        return null
      }
    }

    if (isAddress(address)) {
      return options?.filter((o) => o.value === address)
    }

    return null
  }

  const options = buildAddressOptions(watchedAddresses)
  const selectedOption = getSelectedOption(options, urlAddress)

  return (
    <Wrapper>
      <Select
        options={options}
        onChange={(option: AddressOption) => {
          handleNav(option.value)
        }}
        placeholder="Select Ethereum address..."
        isSearchable={false}
        value={selectedOption}
        useLightBackground
      />
      <AddressModal />
    </Wrapper>
  )
}

export default AddressSelect
