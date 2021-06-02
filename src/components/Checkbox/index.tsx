import React from 'react'
import styled, { css } from 'styled-components'
import Icon from 'components/Icon'

const Wrapper = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;

  &:hover,
  &:focus {
    outline: none;
  }

  &:hover {
    > div:first-child {
      border: 1px solid ${(props) => props.theme.text3};
    }
  }
`

const IconWrapper = styled.div<IconWrapperProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 19px;
  min-width: 19px;
  max-width: 19px;
  height: 19px;
  border-radius: 3px;
  box-shadow: ${(props) => (!props.isChecked ? `inset 0 3px 6px 0 #f8fafd` : `none`)};
  background: ${(props) => (props.isChecked ? props.theme.green1 : props.theme.white)};
  border: 1px solid ${(props) => (props.isChecked ? props.theme.green1 : props.theme.bg0)};

  &:hover,
  &:focus {
    ${(props) =>
      !props.isChecked &&
      css`
        border: 1px solid ${props.theme.text3};
      `}
  }
`

const Label = styled.div<IconWrapperProps>`
  display: flex;
  padding-left: 10px;
  padding-top: 2px;
  justify-content: center;
`

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onClick: (event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement> | null) => any
  isChecked?: boolean
}

type IconWrapperProps = Omit<Props, 'onClick'>

const handleKeyboard = (event: React.KeyboardEvent<HTMLElement>, onClick: Props['onClick']) => {
  if (event.keyCode === 32) {
    onClick(event)
  }
}

export default function Checkbox({ isChecked, children, onClick, ...rest }: Props) {
  return (
    <Wrapper onClick={onClick} onKeyUp={(event) => handleKeyboard(event, onClick)} tabIndex={0} {...rest}>
      <IconWrapper isChecked={isChecked}>{isChecked && <Icon size={16} color={'#ffffff'} icon="CHECK" />}</IconWrapper>
      <Label isChecked={isChecked}>{children}</Label>
    </Wrapper>
  )
}
