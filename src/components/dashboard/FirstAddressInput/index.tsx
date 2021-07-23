import { ButtonPrimary } from 'components/Button'
import Input from 'components/Input'
import Loader from 'components/Loader'
// import ens from 'ethereum-ens'
import ethersProvider from 'connectors/ethersProvider'
import useTheme from 'hooks/useTheme'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { addAddress } from 'state/user/actions'
import styled from 'styled-components'
import { isAddress } from 'utils'
import firebase from '../../../firebase'

const Wrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
`
const Headline = styled.div`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSize.h3};
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  margin-bottom: 14px;
  margin-left: 10px;
`

const NewAddressContentWrapper = styled.div`
  width: 100%;
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  `};
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

  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  margin: 10px 0 0 0
  `};
`

const NewAddressInputWrapper = styled(Input)`
  width: 100%;
  display: flex;
  flex-grow: 1;
`
const FirstAddressInput = () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const history = useHistory()

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
    history.push('/positions/' + hexAddressProcessed)
    setAddress('') // clear the input
    setEnsName('')
    setInputHexAddress('')
    setIsValidAddress(false)
  }

  return (
    <Wrapper>
      <Headline>Enter your Ethereum addresses</Headline>

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
    </Wrapper>
  )
}

export default FirstAddressInput
