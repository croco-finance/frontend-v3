import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './../index'

/**
 * Get total fees for user
 * @param address
 */
export function useTotalUserFees(address: string) {
  const dispatch = useDispatch<AppDispatch>()
  const [error, setError] = useState(false)

  // return data
  return
}
