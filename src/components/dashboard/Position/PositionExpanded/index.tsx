import useTheme from 'hooks/useTheme'
import React from 'react'
import styled from 'styled-components'
import { useExpandedData } from 'state/dashboard/hooks'
import Loader from 'components/Loader'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.bg0};
  padding: 10px;
  border-radius: 10px;
  align-items: center;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`

interface Props {
  tokenId: number
  owner: string
}

const PositionExpanded = ({ owner, tokenId }: Props) => {
  const theme = useTheme()
  const expandedInfo = useExpandedData(owner, tokenId)
  console.log('PositionExpanded, expandedInfo: ', expandedInfo)
  return <Wrapper>{expandedInfo ? <div>{expandedInfo.collectedFeesToken0}</div> : <Loader />}</Wrapper>
}

export default PositionExpanded
