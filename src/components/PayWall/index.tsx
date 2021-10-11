import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { DarkCard } from 'components/Card'
import WalletModal from 'components/WalletModal'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useUnlockProtocolModalToggle, useWalletModalToggle } from 'state/application/hooks'
import styled from 'styled-components'
import { NetworkContextName } from '../../constants/misc'
import { AppState } from '../../state/index'

const Wrapper = styled(DarkCard)`
  border: 4px solid ${({ theme }) => theme.blue1};
  padding: 24px 16px;
`

const H1 = styled.div`
  color: ${({ theme }) => theme.text1};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  font-size: 20px;
`
const Desc = styled.div`
  color: ${({ theme }) => theme.text2};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  margin: 8px 0 4px 0px;
  font-size: 20px;
`
const DescSmall = styled.div`
  color: ${({ theme }) => theme.text3};
  font-weight: ${({ theme }) => theme.fontWeight.regular};
  margin: 16px 0 0 0px;
  font-size: ${({ theme }) => theme.fontSize.normal};
  border-top: 1px solid ${({ theme }) => theme.text5};
  padding-top: 12px;
`

const Button = styled(ButtonPrimary)`
  font-size: 20px;
  margin: 0 auto;
  margin-top: 24px;
  max-width: 200px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: ${({ theme }) => theme.fontSize.normal};
    font-weight: ${({ theme }) => theme.fontWeight.demiBold};
    padding: 5px;
    width: 125px;
    border-radius: 5px;
    margin: 10px auto;  `}
`

const ConnectedToWrapper = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  padding-bottom: 6px;
`

const ConnectedTo = styled.div`
  color: #27ae60;
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  font-size: 20px;
`

const Account = styled.div`
  padding: 8px 10px;
  border-radius: 26px;
  margin-left: 10px;
  // background-color: ${({ theme }) => theme.green1};
  color: white;
  font-weight: ${({ theme }) => theme.fontWeight.demiBold};
  font-size: 18px;
`

const DemiBold = styled.span`
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  // color: ${({ theme }) => theme.blue1};
`

const NotHaveTokenDesc = styled.div`
  text-align: left;
  margin: 20px 0 30px 0;
  font-weight: ${({ theme }) => theme.fontWeight.regular};
`
const Paywall = () => {
  const dispatch = useDispatch()
  const { active, account, connector, error } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const [paywallState, setPaywallState] = useState<'NOT_CONNECTED' | 'CONNECTED_NO_TOKEN' | 'CONNECTED_SUCCESS'>()
  const appIsLocked = useSelector((state: AppState) => state.application.isLocked)
  const addressesModalOpen = useModalOpen(ApplicationModal.UNLOCK_PROTOCOL)
  const toggleUnlockModal = useUnlockProtocolModalToggle()
  const toggleWalletModal = useWalletModalToggle()

  if (!account && !active) {
    return (
      <Wrapper>
        <H1>Croco is now available only to Croco Token holders.</H1>
        <Button onClick={toggleWalletModal}>Connect Wallet</Button>
        <DescSmall>Connect your wallet to check if you have Croco Token.</DescSmall>
        {/* <Web3Status /> */}
        <WalletModal ENSName={undefined} pendingTransactions={[]} confirmedTransactions={[]} />
      </Wrapper>
    )
  }

  if (account) {
    return (
      <Wrapper>
        <ConnectedToWrapper>
          <ConnectedTo>Connected to:</ConnectedTo>
          <Account> {account}</Account>
        </ConnectedToWrapper>
        <NotHaveTokenDesc>
          <Desc>
            You need to have <DemiBold>CROCO TOKEN</DemiBold> on the connected address in order to use Croco.
          </Desc>
        </NotHaveTokenDesc>

        <Button onClick={toggleWalletModal}>Get Croco Token</Button>
        <DescSmall>The membership costs 0.01 ETH per month and you get access to all Croco features.</DescSmall>
        <WalletModal ENSName={undefined} pendingTransactions={[]} confirmedTransactions={[]} />
      </Wrapper>
    )
  }

  return null
}

export default Paywall
