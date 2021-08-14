import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'

import application from './application/reducer'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import lists from './lists/reducer'
import multicall from './multicall/reducer'
import protocol from './protocol/reducer'
import tokens from './tokens/reducer'
import pools from './pools/reducer'
import simulator from './simulator/reducer'
import positions from './dashboard/reducer'

const PERSISTED_KEYS: string[] = ['user', 'lists']

const store = configureStore({
  reducer: {
    application,
    user,
    multicall,
    lists,
    protocol,
    tokens,
    pools,
    simulator,
    positions,
  },
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['positions/updatePositionData', 'positions/addExtendedData'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['positions', 'positions/addExtendedData'],
      },
    }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
