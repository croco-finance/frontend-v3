import { useColor } from 'hooks/useColor'
import { PageWrapper, ThemedBackground } from 'pages/styled'
import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components'
import AddressSelect from 'components/dashboard/AddressSelect'

const AddressPoolWrapper = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.text4};
  padding: 10px 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `};
`
const AddressSelectWrapper = styled.div`
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  `};
`
const PoolSelectWrapper = styled.div`
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  `};
`

const Dashboard = ({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  // theming
  const backgroundColor = useColor(address)

  // address can be combined from multiple addresses joined with a plus symbol (in case of bundeled addresses)
  const addresses = address ? address.split('+') : []

  // TODO fetch data for addresses

  // console.log('totalUserFees', totalUserFees)

  // Effective Sytems: 0x95ae3008c4ed8c2804051dd00f7a27dad5724ed1
  // ETH/FLI           0x151ccb92bc1ed5c6d0f9adb5cec4763ceb66ac7f

  // hayden.eth: 0x11e4857bb9993a50c685a79afad4e6f65d518dda
  // DAI/USDC:   0x6c6bc977e13df9b0de53b251522280bb72383700
  // UNI/WETH:   0x1d42064fc4beb5f8aaf85f4617ae8b3b5b8bd801

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <AddressPoolWrapper>
        <AddressSelectWrapper>
          <AddressSelect />
        </AddressSelectWrapper>
        <PoolSelectWrapper>Pool: 0x151ccb92bc1ed5c6d0f9adb5cec4763ceb66ac7f</PoolSelectWrapper>
      </AddressPoolWrapper>
    </PageWrapper>
  )
}

export default Dashboard
