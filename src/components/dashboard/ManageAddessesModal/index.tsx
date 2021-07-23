import { ButtonPrimary } from 'components/Button'
import Icon from 'components/Icon'
import Input from 'components/Input'
import Loader from 'components/Loader'
// import ens from 'ethereum-ens'
import ethersProvider from 'connectors/ethersProvider'
import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { ApplicationModal } from 'state/application/actions'
import { useDashboardAddressesModalToggle, useModalOpen } from 'state/application/hooks'
import { addAddress, deleteAddress, setBundledAddress } from 'state/user/actions'
import { useWatchedAddresses } from 'state/user/hooks'
import styled from 'styled-components'
import { isAddress } from 'utils'
import Modal from '../../Modal'
import firebase from '../../../firebase'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
`

const Content = styled.div`
  padding: 28px 20px 10px 20px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    background-color: ${(props) => props.theme.bg0};
    width: 8px;
    border-radius: 8px;
  }
  /* background of the scrollbar except button or resizer */
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  /* scrollbar itself */
  ::-webkit-scrollbar-thumb {
    /* 7F7F7F for mac-like color */
    background-color: ${(props) => props.theme.text4};
    border-radius: 10px;
    border: 1px solid ${(props) => props.theme.text4};
  }

  ::-webkit-scrollbar-thumb:hover {
    /* 7F7F7F for mac-like color */
    background-color: ${(props) => props.theme.text3};
    border: 1px solid ${(props) => props.theme.text3};
  }

  /* set button(top and bottom of the scrollbar) */
  ::-webkit-scrollbar-button {
    display: none;
  }
`

const Headline = styled.div`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSize.h2};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  margin-bottom: 22px;
  margin-left: 10px;
`

const NewAddressContentWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  min-height: 74px;
`
const InputWrapper = styled.div`
  margin: 10px 0;
  padding: 10px 14px 10px 10px;
  display: flex;
  border: 1px solid ${({ theme }) => theme.text4};
  border-radius: 10px;
  flex-direction: column;
  width: 100%;
`
const AddAddressButton = styled(ButtonPrimary)<{ disabled: boolean }>`
  padding: 8px 10px;
  border: none;
  margin-left: 14px;
  width: 220px;
  height: 48px;

  &:focus {
    outline: 0;
  }
`

const MainRowWrapper = styled.div`
  display: flex;
`
const WatchedAddress = styled.div`
  color: ${({ theme }) => theme.text2};
  font-size: ${({ theme }) => theme.fontSize.small};
  text-align: left;
  padding: 0;
  width: 100%;
  // display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 5px;
`

const AddressLink = styled.a`
  margin: 0 8px;
  display: flex;
  align-items: center;
`

const EnsName = styled.div`
  color: ${({ theme }) => theme.text3};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSize.small};
`

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
`

const StyledIcon = styled(Icon)`
  cursor: pointer;
`

const BundleButton = styled.button<{ isBundled: boolean }>`
  display: flex;
  align-items: center;
  border: 1px solid;
  border-color: ${(props) => (props.isBundled ? props.theme.blue1 : props.theme.text2)};
  color: ${(props) => props.theme.white};
  padding: 5px 8px;
  background-color: ${(props) => (props.isBundled ? props.theme.blue1 : 'inherit')};
  border-radius: 5px;
  margin-left: 14px;
  margin-right: 14px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  width: 94px;
  &:focus {
    outline: 0;
  }
`

const WatchedHeadline = styled.div`
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  text-align: left;
  margin-bottom: 10px;
  margin-top: 20px;
  padding-left: 10px;
`

const CheckIcon = styled(Icon)`
  margin-left: 5px;
`

const NewAddressInputWrapper = styled(Input)`
  width: 100%;
  display: flex;
  flex-grow: 1;
`

const WatchedAddressesList = styled.div``
const AddressModal = () => {
  const theme = useTheme()
  const dispatch = useDispatch()

  const addressesModalOpen = useModalOpen(ApplicationModal.DASHBOARD_ADDRESSES)
  const toggleAddressesModal = useDashboardAddressesModalToggle()
  const watchedAddresses = useWatchedAddresses()

  const [ensName, setEnsName] = useState('')
  const [loadingEnsDomain, setLoadingEnsDomain] = useState(false)
  const [inputHexAddress, setInputHexAddress] = useState('')
  const [address, setAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)

  const handleAddressChange = async (input: string) => {
    setIsValidAddress(false)
    setLoadingEnsDomain(false) // just to double check

    // check for ETH address validity
    if (isAddress(input)) {
      setAddress(input)
      setIsValidAddress(true)
      setInputHexAddress(input)
      return
    }

    // check if valid ENS name
    if (input.substring(input.length - 4) === '.eth') {
      try {
        setLoadingEnsDomain(true)
        const ensHexAddress = await ethersProvider.resolveName(input)
        if (ensHexAddress) {
          setAddress(input)
          setEnsName(input)
          setInputHexAddress(ensHexAddress.toLocaleLowerCase())
          setIsValidAddress(true)
          setLoadingEnsDomain(false)
          return
        }
      } catch (e) {
        console.log('Could not get eth address from ENS name')
        setIsValidAddress(false)
      }
    }

    setIsValidAddress(false)
    setLoadingEnsDomain(false)
  }

  const addNewAddress = () => {
    const hexAddressProcessed = inputHexAddress.trim().toLowerCase()
    dispatch(addAddress({ address: hexAddressProcessed, ens: ensName }))
    // save to firebase and double check you don't store null value
    if (isAddress(hexAddressProcessed)) {
      const firebaseRef = firebase.addresses(hexAddressProcessed.toLowerCase())
      firebaseRef.set(true)
    }
    // clear the input
    setAddress('')
    setEnsName('')
    setInputHexAddress('')
    setIsValidAddress(false)
  }

  const getModalContent = () => {
    return (
      <Content>
        <Headline>Manage addresses</Headline>

        <NewAddressContentWrapper>
          <NewAddressInputWrapper
            placeholder="Enter ENS domain or valid Ethereum address"
            onChange={(event) => {
              handleAddressChange(event.target.value.trim())
              setAddress(event.target.value.trim())
            }}
            value={address}
            textAlign="left"
          />
          <AddAddressButton
            onClick={() => {
              addNewAddress()
            }}
            disabled={!isValidAddress}
          >
            {loadingEnsDomain ? <Loader /> : 'Add to watch list'}
          </AddAddressButton>
        </NewAddressContentWrapper>
        {Object.keys(watchedAddresses).length > 0 && (
          <>
            <WatchedHeadline>Watched addresses</WatchedHeadline>
            <WatchedAddressesList>
              {Object.keys(watchedAddresses).map((address) => {
                // just double check the address is valid
                if (address) {
                  return (
                    <InputWrapper key={address}>
                      <MainRowWrapper>
                        <WatchedAddress>{address}</WatchedAddress>
                        <ButtonsWrapper>
                          <AddressLink
                            href={`https://etherscan.io/address/${address}`}
                            rel="noreferrer noopener"
                            target="_blank"
                          >
                            <StyledIcon icon="EXTERNAL_LINK" size={18} color={theme.text2} />
                          </AddressLink>

                          <BundleButton
                            isBundled={watchedAddresses[address].bundled}
                            onClick={() => dispatch(setBundledAddress({ address }))}
                          >
                            {watchedAddresses[address].bundled ? (
                              <>
                                Bundled
                                <CheckIcon icon="CHECK" size={16} color={theme.white} />
                              </>
                            ) : (
                              'Bundle'
                            )}
                          </BundleButton>
                          {/* <StyledIcon icon="edit" size={16} color={colors.FONT_LIGHT} /> */}
                          <StyledIcon
                            icon="CLOSE"
                            size={18}
                            color={theme.text2}
                            hoverColor={theme.red1}
                            onClick={() => dispatch(deleteAddress({ address }))}
                          />
                        </ButtonsWrapper>
                      </MainRowWrapper>

                      {watchedAddresses[address].ens && <EnsName>{watchedAddresses[address].ens}</EnsName>}
                    </InputWrapper>
                  )
                }
                return null
              })}
            </WatchedAddressesList>
          </>
        )}
        {/* <CloseIcon onClick={toggleAddressesModal}>
          <CloseColor />
        </CloseIcon> */}
      </Content>
    )
  }

  return (
    <Modal isOpen={addressesModalOpen} onDismiss={toggleAddressesModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}

export default AddressModal
