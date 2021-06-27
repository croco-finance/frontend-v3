import React from 'react'
import { UnmountClosed } from 'react-collapse'
import styled from 'styled-components'
import './index.css'

const Header = styled.div<{ roundedBottom: boolean }>``

const Content = styled.div``

interface Props {
  isOpened: boolean
  header: React.ReactNode
  collapseBody: React.ReactNode
}

export default function CollapsibleContainer({ isOpened, collapseBody, header }: Props) {
  return (
    <div>
      <Header className="config" roundedBottom={!isOpened}>
        {header}
      </Header>
      <UnmountClosed isOpened={isOpened}>
        <Content className="text">{collapseBody}</Content>
      </UnmountClosed>
    </div>
  )
}
