import useTheme from 'hooks/useTheme'
import React from 'react'
import styled from 'styled-components'

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
}

const PositionExpanded = ({ tokenId }: Props) => {
  const theme = useTheme()
  // const expandedInfo = useExpandedInfo(tokenId)
  const expandedInfo = undefined

  // console.log('PositionExpanded, expandedInfo: ', expandedInfo)
  return <Wrapper>{/* {expandedInfo ? <div>{expandedInfo.collectedFeesToken0}</div> : <Loader />} */}</Wrapper>
}

export default PositionExpanded
