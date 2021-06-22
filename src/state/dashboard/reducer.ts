import { createReducer } from '@reduxjs/toolkit'
import { setBundledAddress, addAddress, deleteAddress } from './actions'
import JSBI from 'jsbi'

interface Tick {
  index: number
  price0: number
  price1: number
}

interface TokenFees {
  feesToken0: number
  feesToken1: number
}

interface Liquidity {
  // it should be possible to get these numbers using Uni-v3 SDK and params: { lowerTick, UpperTick, currentTick, liquidity }
  liquidityToken0: number
  liquidityToken1: number
}

interface Token {
  name: string
  symbol: string
  address: string
  decimals: number

  // We will use derivedETH price in combination with the current USD price of ETH in order to get the current USD price f token
  // The current USD price of ETH price is already accessible via useEthPrices() hook
  derivedETH: number
}

interface Snapshot {
  id: string
  owner: string
  pool: string
  // how many fees did the user withdraw
  collectedFeesToken0: number
  collectedFeesToken1: number
  // how many tokens did the user deposited in a given position
  depositedToken0: number
  depositedToken1: number
  // how many tokens did the user withdrew from a given position
  withdrawnToken0: number
  withdrawnToken1: number
  // How many tokens did the user have after this snaphot/action happened
  amountToken0: number
  amountToken1: number
  // transaction related to this snapshot
  transaction: Transaction
}

interface Transaction {
  // TODO: NOT FINISHED YET. Think what exactly do you need here
  id: string
  blockNumber: number
  timestamp: number
  gasUsed: number
  gasPrice: number
  ethPriceUSD: number | undefined // price of ETH at the time this transaction happend
  // differenciate between tokens sent and received (maybe use mint | burn | swap format somehow)
  amountToken0: number
  amountToken1: number
  type: 'add' | 'remove' | 'swap' // transaction type
}

interface PositionFees {
  // key is timestamp
  [key: number]: TokenFees
}

interface DailyFees {
  // key is position id
  [key: string]: PositionFees
}

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  liquidityGross: JSBI
  liquidityNet: JSBI
  tickIdx: number
  liquidityActive: JSBI
  price0: string
  price1: string
}

interface PoolTickData {
  ticksProcessed: TickProcessed[]
  feeTier: string
  tickSpacing: number
  activeTickIdx: number
}

interface Position {
  id: number // Position ID
  owner: string // User Address
  pool: string // Poll address/ID
  token0: Token
  token1: Token
  tickLower: number
  tickUpper: number
  tickCurrent: number
  feeTier: number

  // Position specific
  currentLiquidity: Liquidity

  // Sum of all (un)colected fees
  collectedFees: TokenFees
  uncollectedFees: TokenFees // TODO

  // Snapshot of position changes
  snapShots: Snapshot[]

  // Daily fees
  dailyFees: DailyFees | undefined

  // Data that will be used to render liqudity distribution chart
  // This will be the same chart as in PoolPage, so you can try to load from state.pools.tickData
  // It's not unique for position, but to the pool. I don't have to have it stored for every position
  // There will just be additional lines mark the position limit ticks
  tickData: PoolTickData | undefined

  // Transactions related to this position, sorted by timestamp
  transactions: Transaction[] | undefined

  // Timestamp of when we recieved data about this position
  lastUpdated: number | undefined
}

interface Positions {
  // keys are user address and pool address
  byUser: { [key: string]: { byPool: { [key: string]: Position[] } } }
}

interface UserAddress {
  bunded: boolean
  ensName: string // maybe this can be computed directly in UI while rendering, it doesn't have to be saved in state
}

interface UserAddresses {
  // key is address
  [key: string]: UserAddress[]
}

export interface AddressData {
  bundled: boolean
  ens: string
}

export interface DashboardState {
  // Addresses saved in local storage
  // userAddresses: UserAddresses
  userAddresses: { [key: string]: AddressData }
  // selectedAddress: string // selected adresa je ta, která je v URL, asi nemusí byt ve stavu. Staci kdyz si ji bude drzet kompoennta
  // positions: Positions
}

const initialState: DashboardState = {
  userAddresses: {
    '0xa8eac1ec5054543ba627d0a06a96be024a6e924b': {
      bundled: true,
      ens: 'kokot.eth',
    },
    '0xb652c617d18971a53f3727e01f6e86f975312c28': {
      bundled: true,
      ens: '',
    },
    '0x95ae3008c4ed8c2804051dd00f7a27dad5724ed1': {
      bundled: false,
      ens: 'debilpochcanej.eth',
    },
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setBundledAddress, (state, action) => {
      const { address } = action.payload
      const { bundled } = state.userAddresses[address]
      state.userAddresses[address].bundled = !bundled
    })
    .addCase(addAddress, (state, action) => {
      const { address, ens } = action.payload
      state.userAddresses[address] = { bundled: false, ens }
    })
    .addCase(deleteAddress, (state, action) => {
      const { address } = action.payload
      delete state.userAddresses[address]
    })
)
