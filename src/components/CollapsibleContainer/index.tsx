import React, { useState } from 'react'
import { UnmountClosed } from 'react-collapse'
import styled from 'styled-components'
import './index.css'

const Header = styled.div<{ roundedBottom: boolean }>`
  cursor: pointer;
`

const Content = styled.div``

interface Props {
  isOpenedDefault?: boolean
  header: React.ReactNode
  collapseBody: React.ReactNode
  onChange?: any
}

export default function CollapsibleContainer({ isOpenedDefault = false, collapseBody, header, onChange }: Props) {
  const [isOpened, setIsOpened] = useState(isOpenedDefault)
  return (
    <div>
      <Header
        className="config"
        roundedBottom={!isOpened}
        onClick={() => {
          setIsOpened(!isOpened)
          onChange(!isOpened)
        }}
      >
        {header}
      </Header>

      <UnmountClosed isOpened={isOpened}>
        <Content className="text">{collapseBody}</Content>
      </UnmountClosed>
    </div>
  )
}
