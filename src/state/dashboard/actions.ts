import { createAction } from '@reduxjs/toolkit'

export const setBundledAddress = createAction<{ address: string }>('dashboard/setBundledAddress')
export const addAddress = createAction<{ address: string; ens: string }>('dashboard/addNewAddress')
export const deleteAddress = createAction<{ address: string }>('dashboard/deleteAddress')
