import { useSelector } from 'react-redux'
import { AppState } from './../index'
import { DashboardState } from './reducer'

export function useDashboardAddresses(): DashboardState['userAddresses'] {
  return useSelector((state: AppState) => state.dashboard.userAddresses)
}
