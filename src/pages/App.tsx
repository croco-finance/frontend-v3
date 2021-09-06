import React, { Suspense, useState, useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Home from './Home'
import Protocol from './Protocol'
import PoolsOverview from './Pool/PoolsOverview'
import TokensOverview from './Token/TokensOverview'
import TopBar from 'components/Header/TopBar'
import Simulator from './Simulator'
import Dashboard from './Dashboard'
import LandingPage from './LandingPage'
import { RedirectInvalidToken } from './Token/redirects'
import { LocalLoader } from 'components/Loader'
import PoolPage from './Pool/PoolPage'
import { ExternalLink, HideMedium, TYPE } from 'theme'
import { useSubgraphStatus } from 'state/application/hooks'
import { DarkGreyCard } from 'components/Card'
import Resize from 'components/Resize'
import VM from '@ethereumjs/vm'
import { deployContractAndGetVm } from '../data/dashboard/contractUtils'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  width: 100%;
  position: fixed;
  justify-content: space-between;
  z-index: 2;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 40px;
  margin-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-top: 2rem;
    margin-top: 100px;
  `};

  z-index: 1;

  > * {
    max-width: 1200px;
  }
`

const Marginer = styled.div`
  margin-top: 5rem;
`
export const VMContext = React.createContext<VM | undefined>(undefined)

export default function App() {
  // pretend load buffer
  const [loading, setLoading] = useState(true)
  // deploy local vm
  const [vm, setVM] = useState<VM | undefined>(undefined)

  useEffect(() => {
    async function deployVM() {
      const vm = await deployContractAndGetVm()
      setVM(vm)
    }
    if (!vm) {
      deployVM()
    }
    setTimeout(() => setLoading(false), 1300)
  }, [vm])

  // subgraph health
  const [subgraphStatus] = useSubgraphStatus()

  return (
    <Suspense fallback={null}>
      <Resize />
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      {loading ? (
        <LocalLoader fill={true} />
      ) : subgraphStatus.available === false ? (
        <AppWrapper>
          <BodyWrapper>
            <DarkGreyCard style={{ maxWidth: '340px' }}>
              <TYPE.label>
                The Graph network which provides data for this site is temporarily down. Check status{' '}
                <ExternalLink href="https://thegraph.com/explorer/subgraph/ianlapham/uniswap-v3-testing">
                  here.
                </ExternalLink>
              </TYPE.label>
            </DarkGreyCard>
          </BodyWrapper>
        </AppWrapper>
      ) : (
        <AppWrapper>
          <URLWarning />
          <HeaderWrapper>
            <HideMedium>
              <TopBar />
            </HideMedium>
            <Route path="/" component={Header} />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <VMContext.Provider value={vm}>
              <Switch>
                <Route exact strict path="/" component={LandingPage} />
                <Route exact strict path="/overview" component={Home} />
                <Route exact strict path="/protocol" component={Protocol} />
                <Route exact strict path="/pools" component={PoolsOverview} />
                <Route exact strict path="/tokens" component={TokensOverview} />
                <Route exact strict path="/tokens/:address" component={RedirectInvalidToken} />
                <Route exact strict path="/pools/:address" component={PoolPage} />
                <Route exact strict path="/simulator" component={Simulator} />
                <Route exact strict path="/simulator/:address" component={Simulator} />
                <Route exact strict path="/positions" component={Dashboard} />
                <Route exact strict path="/positions/:address" component={Dashboard} />
              </Switch>
            </VMContext.Provider>
            <Marginer />
          </BodyWrapper>
        </AppWrapper>
      )}
    </Suspense>
  )
}
