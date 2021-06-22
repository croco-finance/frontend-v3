import * as React from 'react'
import { createRef, useEffect } from 'react'
import styled, { css } from 'styled-components'

interface InputProps extends Props {
  inputAddonWidth?: number
}

const StyledInput = styled.input<InputProps>`
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  font-size: ${({ theme }) => theme.fontSize.normal};
  text-align: ${(props) => props.textAlign};
  padding: 1px ${(props) => (props.textIndent ? `${props.textIndent[1] + 12}px` : '12px')} 0
    ${(props) => (props.textIndent ? `${props.textIndent[0] + 12}px` : '12px')};

  border-radius: 10px;
  border: ${(props) => (props.noBorder ? 'none' : '2px solid')};
  border-color: ${(props) => (props.useDarkBorder ? props.theme.white : props.theme.text4)};
  outline: none;
  box-sizing: border-box;
  width: 100%;
  height: ${(props) => (props.variant === 'small' ? '38px' : '48px')};
  transition: border 150ms ease-out;
  -moz-appearance: textfield;
  text-overflow: ellipsis;
  ${(props) =>
    props.height
      ? css`
          height: ${props.height}px;
        `
      : 'auto'};

  &:focus {
    border-color: ${({ theme }) => theme.blue1};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text3};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  }

  // styles for disabled input
  background-color: ${(props) => (props.disabled ? props.theme.bg1 : props.theme.black1)};

  color: ${(props) => (props.disabled ? props.theme.text3 : props.theme.text1)};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'auto')};
`

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  // hide arrows when input type = number
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const InputAddon = styled.div<{ align: 'left' | 'right' }>`
  position: absolute;
  top: 1px;
  bottom: 1px;
  display: flex;
  align-items: center;

  ${(props) =>
    props.align === 'right' &&
    css`
      right: 10px;
    `}

  ${(props) =>
    props.align === 'left' &&
    css`
      left: 10px;
    `}
`

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  innerRef?: React.Ref<HTMLInputElement>
  variant?: 'small' | 'large'
  label?: React.ReactElement | string
  labelAddon?: React.ReactElement
  labelRight?: React.ReactElement
  innerAddon?: React.ReactNode
  isDisabled?: boolean
  isLoading?: boolean
  type?: string
  addonAlign?: 'left' | 'right'
  noError?: boolean
  labelAddonIsVisible?: boolean
  textIndent?: [number, number] // [left, right]
  clearButton?: boolean
  noBorder?: boolean
  onClear?: () => void
  useWhiteBackground?: boolean
  useDarkBorder?: boolean
  height?: number
  textAlign?: 'left' | 'right'
}

export default function Input({
  value,
  type = 'text',
  innerRef,
  variant = 'large',
  width,
  height,
  label,
  labelAddon,
  labelRight,
  innerAddon,
  isDisabled,
  labelAddonIsVisible,
  clearButton,
  onClear,
  addonAlign = 'right',
  noError = false,
  textIndent = [0, 0],
  noBorder = false,
  useWhiteBackground = false,
  useDarkBorder = false,
  textAlign = 'right',
  ...rest
}: Props) {
  const inputAddonRef = createRef<HTMLDivElement>()
  const [inputAddonWidth, setInputAddonWidth] = React.useState(0)

  useEffect(() => {
    if (inputAddonRef.current) {
      const rect = inputAddonRef.current.getBoundingClientRect()
      setInputAddonWidth(rect.width + 10) // addon ha absolute pos with 10px offset
    } else {
      setInputAddonWidth(0)
    }
  }, [inputAddonRef])

  return (
    <InputWrapper>
      {innerAddon && addonAlign === 'left' && (
        <InputAddon align="left" ref={inputAddonRef}>
          {innerAddon}
        </InputAddon>
      )}
      {((innerAddon && addonAlign === 'right') || clearButton) && (
        <InputAddon align="right" ref={inputAddonRef}>
          {addonAlign === 'right' && innerAddon}
        </InputAddon>
      )}

      <StyledInput
        value={value}
        textIndent={textIndent}
        type={type}
        spellCheck={false}
        variant={variant}
        disabled={isDisabled}
        width={width}
        ref={innerRef}
        inputAddonWidth={inputAddonWidth}
        noBorder={noBorder}
        useWhiteBackground={useWhiteBackground}
        useDarkBorder={useDarkBorder}
        textAlign={textAlign}
        {...rest}
      />
    </InputWrapper>
  )
}
