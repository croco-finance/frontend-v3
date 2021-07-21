import { createReducer, nanoid } from '@reduxjs/toolkit'
import {
  addPopup,
  PopupContent,
  removePopup,
  updateBlockNumber,
  updateSubgraphStatus,
  ApplicationModal,
  setOpenModal,
  updateWindowSize,
} from './actions'

import { MEDIA_WIDTHS } from 'theme'

const sizes = {
  EXTRA_SMALL: MEDIA_WIDTHS.upToExtraSmall,
  SMALL: MEDIA_WIDTHS.upToSmall,
  MEDIUM: MEDIA_WIDTHS.upToMedium,
  LARGE: MEDIA_WIDTHS.upToLarge,
}

const getSize = (screenWidth: number | null): ApplicationState['screen']['screenSize'] => {
  if (!screenWidth) {
    return 'NORMAL'
  }

  if (screenWidth < sizes.EXTRA_SMALL) {
    return 'TINY'
  }

  if (screenWidth <= sizes.SMALL) {
    return 'EXTRA_SMALL'
  }

  if (screenWidth <= sizes.MEDIUM) {
    return 'SMALL'
  }

  if (screenWidth <= sizes.LARGE) {
    return 'MEDIUM'
  }

  if (screenWidth > sizes.LARGE) {
    return 'LARGE'
  }

  return 'MEDIUM'
}

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  readonly blockNumber: { readonly [chainId: number]: number }
  readonly popupList: PopupList
  readonly openModal: ApplicationModal | null
  readonly subgraphStatus: {
    available: boolean | null
    syncedBlock: number | undefined
  }
  readonly screen: {
    screenSize: 'TINY' | 'EXTRA_SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'NORMAL'
    screenWidth: number | null
    screenHeight: number | null
  }
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
  openModal: null,
  subgraphStatus: {
    available: null,
    syncedBlock: undefined,
  },
  screen: {
    screenSize: 'NORMAL',
    screenWidth: null,
    screenHeight: null,
  },
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(setOpenModal, (state, action) => {
      state.openModal = action.payload
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
    .addCase(updateSubgraphStatus, (state, { payload: { available, syncedBlock } }) => {
      state.subgraphStatus = {
        available,
        syncedBlock,
      }
    })
    .addCase(updateWindowSize, (state, { payload: { screenWidth, screenHeight } }) => {
      state.screen = {
        screenSize: getSize(screenWidth),
        screenWidth,
        screenHeight,
      }
    })
)
