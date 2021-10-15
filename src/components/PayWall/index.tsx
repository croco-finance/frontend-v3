import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { DarkCard } from 'components/Card'
import WalletModal from 'components/WalletModal'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useUnlockProtocolModalToggle, useWalletModalToggle } from 'state/application/hooks'
import styled from 'styled-components'
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

type UnlockState = 'LOCKED' | 'UNLOCKED' | 'PENDING'

const Paywall = () => {
  const { active, account } = useWeb3React()

  const [paywallState, setPaywallState] = useState<'NOT_CONNECTED' | 'CONNECTED_NO_TOKEN' | 'CONNECTED_SUCCESS'>()
  const appIsLocked = useSelector((state: AppState) => state.application.isLocked)
  const addressesModalOpen = useModalOpen(ApplicationModal.UNLOCK_PROTOCOL)
  const toggleUnlockModal = useUnlockProtocolModalToggle()
  const toggleWalletModal = useWalletModalToggle()
  const [unlock, setUnclock] = useState<UnlockState>('PENDING')

  const unlockToken = () => {
    // eslint-disable-next-line no-unused-expressions
    const newWindow: any = window as any
    if (newWindow.unlockProtocol) {
      newWindow.unlockProtocol.loadCheckoutModal(/* optional configuration */)
    }
  }

  const unlockHandler = (e: any) => {
    setUnclock(e.detail)
  }

  useEffect(() => {
    window.addEventListener('unlockProtocol', unlockHandler)
    window.addEventListener('unlockProtocol.status', (e: any) => {
      const state = e.detail
      // the state is a string whose value can either be 'unlocked' or 'locked'...
      // If state is 'unlocked': implement code here which will be triggered when
      // the current visitor has a valid lock key
      // If state is 'locked': implement code here which will be
      // triggered when the current visitor does not have a valid lock key
    })

    // window.addEventListener('unlockProtocol.status', (event: any) => {
    //     // We hide all .unlock-content elements
    //     if (document && document.querySelector) {
    //         document.querySelector('.unlock-content').style.display = 'none';
    //         // We show only the relevant element
    //         document
    //             .querySelectorAll(`.unlock-content.${event.detail.state}`)
    //             .forEach(element => {
    //                 element.style.display = 'block';
    //             });
    //     }
    // });

    window.addEventListener('unlockProtocol.authenticated', (event: any) => {
      // event.detail.addresss includes the address of the current user, when known
    })

    window.addEventListener('unlockProtocol.transactionSent', (event: any) => {
      // event.detail.hash includes the hash of the transaction sent
    })

    return () => window.removeEventListener('unlockProtocol', unlockHandler)
  }, [])

  if (!account && !active) {
    return (
      <Wrapper>
        <H1>Croco is now available only to Croco Token holders.</H1>
        <Button onClick={toggleWalletModal}>Connect Wallet</Button>
        <DescSmall>Connect your wallet to check if you have Croco Token.</DescSmall>
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

        <Button onClick={unlockToken}>Get Croco Token</Button>
        <DescSmall>The membership costs 0.01 ETH per month and you get access to all Croco features.</DescSmall>
        <WalletModal ENSName={undefined} pendingTransactions={[]} confirmedTransactions={[]} />
      </Wrapper>
    )
  }

  return null
}

export default Paywall
