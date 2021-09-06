import { ButtonPrimary } from 'components/Button'
import Loader from 'components/Loader'
import ethersProvider from 'connectors/ethersProvider'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { useHistory } from 'react-router-dom'
import { addAddress } from 'state/user/actions'
import styled from 'styled-components'
import { isAddress } from 'utils'
import firebase from '../../firebase'
import Banner from './Banner'
import Features from './Features'

const CONTENT_WIDTH = 1200
const INPUT_HEIGHT = '66px'
const INPUT_HEIGHT_SMALL = '50px'
const INPUT_BORDER_RADIUS = '10px'

const MainWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.bg0};
  padding-bottom: 100px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-left: 10px;
    padding-right: 10px;
 `};
`

const AnimatedWrapper = styled.div`
  width: 100%;
  max-width: 740px;
`
const ContentWrapper = styled.div`
  max-width: ${CONTENT_WIDTH}px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const IllustrationWrapper = styled.h1`
  margin-top: 50px;
  margin-bottom: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin-top: 90px;
  font-size:  ${({ theme }) => theme.fontSize.normal}; 
 `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
 margin-top: 20px;
 `};
`
const SubBannerHeadline = styled.div`
  font-size: 20px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text3};
  margin-bottom: 40px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: ${({ theme }) => theme.fontSize.normal};
  `};
`

const AddressInputWrapper = styled.div`
  margin: 0 10px;
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 5px;
    border-radius: 6px;
    margin: 0;
    flex-direction: column;
  `};
`

const AddressInput = styled.input`
  padding: 18px;
  margin-right: 10px;
  border: none;
  flex-grow: 1;
  font-size: 18px;
  cursor: text;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text1};
  letter-spacing: 0.4px;
  border: 1px solid ${({ theme }) => theme.text5};
  padding-left: 20px;
  border-radius: ${INPUT_BORDER_RADIUS};
  height: ${INPUT_HEIGHT};
  background-color: ${({ theme }) => theme.bg0};
  &:focus {
    /* border: none; */
    outline: none;
  }
  &::placeholder {
    color: ${({ theme }) => theme.text3};
    /* color: #c4c4c8; */
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${({ theme }) => theme.fontSize.small};
    padding: 8px;
    margin-right: 0;
    height: ${INPUT_HEIGHT_SMALL};
  `};
`

const GoButton = styled(ButtonPrimary)`
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  font-size: 18px;
  width: 130px;
  height: ${INPUT_HEIGHT};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: ${({ theme }) => theme.fontSize.normal};
  padding: 5px;
  margin: 20px auto;;
  border-radius: 5px;
  height: ${INPUT_HEIGHT_SMALL};
`};
`

const UniLink = styled.a`
  color: ${({ theme }) => theme.pink1};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

// props: RouteComponentProps<any>
const LandingPage = (props: RouteComponentProps<any>) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [inputAddress, setInputAddress] = useState('')
  const [inputHexAddress, setInputHexAddress] = useState('')
  const [ensName, setEnsName] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [loadingEnsDomain, setLoadingEnsDomain] = useState(false)

  const handleAddressChange = async (input: string) => {
    setIsValidAddress(false)
    setLoadingEnsDomain(false) // just to double check

    // check for ETH address validity
    if (isAddress(input)) {
      setInputAddress(input)
      setIsValidAddress(true)
      setInputHexAddress(input.toLowerCase())
      return
    }

    // check if valid ENS name
    if (input.substring(input.length - 4) === '.eth') {
      try {
        setLoadingEnsDomain(true)
        const ensHexAddress = await ethersProvider.resolveName(input)
        if (ensHexAddress) {
          setEnsName(input)
          setInputAddress(input)
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

  const handleButtonOnClick = () => {
    if (isValidAddress) {
      const hexAddressProcessed = inputHexAddress.trim().toLowerCase()
      dispatch(addAddress({ address: hexAddressProcessed, ens: ensName }))
      // save to firebase and double check you don't store null value
      if (isAddress(hexAddressProcessed)) {
        const firebaseRef = firebase.addresses(hexAddressProcessed.toLowerCase())
        firebaseRef.set(true)
      }
      history.push('/positions/' + hexAddressProcessed)
      setInputAddress('') // clear the input
      setEnsName('')
      setInputHexAddress('')
      setIsValidAddress(false)
    }
  }

  return (
    <>
      <MainWrapper>
        <ContentWrapper>
          <AnimatedWrapper>
            {/* <Fade direction="up" delay={400} triggerOnce> */}
            <IllustrationWrapper>
              <Banner />
            </IllustrationWrapper>
            <SubBannerHeadline>
              The best tool for{' '}
              <UniLink href="https://uniswap.org/" target="_blank">
                Uniswap v3
              </UniLink>{' '}
              liquidity providers
            </SubBannerHeadline>
            <AddressInputWrapper>
              <AddressInput
                type="text"
                spellCheck={false}
                placeholder="Enter ENS domain or valid Ethereum address"
                value={inputAddress}
                onChange={(event) => {
                  handleAddressChange(event.target.value.trim())
                  setInputAddress(event.target.value.trim())
                }}
              />
              <GoButton
                disabled={!isValidAddress}
                onClick={(e) => {
                  handleButtonOnClick()
                }}
              >
                {loadingEnsDomain ? <Loader size="14px" /> : "Let's Go!"}
              </GoButton>
            </AddressInputWrapper>
            {/* </Fade> */}
          </AnimatedWrapper>

          <Features />
        </ContentWrapper>
      </MainWrapper>
    </>
  )
}
export default LandingPage
