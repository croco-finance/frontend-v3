import React from 'react'
import styled from 'styled-components'

export const ToggleWrapper = styled.button<{ width?: string; height?: string }>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width ?? '100%'}
  padding: 1px;
  background: ${({ theme }) => theme.bg0};
  border-radius: 10px;
  border: ${({ theme }) => '2px solid ' + theme.bg2};
  cursor: pointer;
  outline: none;
  height: ${({ height }) => height ?? '100%'}

`

export const ToggleElement = styled.span<{ isActive?: boolean; fontSize?: string }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 0.5rem;
  border-radius: 6px;
  justify-content: center;
  height: 100%;
  background: ${({ theme, isActive }) => (isActive ? theme.bg2 : 'none')};
  color: ${({ theme, isActive }) => (isActive ? theme.text1 : theme.text3)};
  font-size: ${({ fontSize }) => fontSize ?? '1rem'};
  font-weight: 500;
  :hover {
    user-select: initial;
    color: ${({ theme, isActive }) => (isActive ? theme.text2 : theme.text3)};
  }
`

export interface ToggleProps {
  options: string[]
  activeIndex: number
  toggle: (index: number) => void
  id?: string
  width?: string
  height?: string
}

export default function MultiToggle({ id, options, activeIndex, toggle, width, height }: ToggleProps) {
  return (
    <ToggleWrapper id={id} width={width} height={height}>
      {options.map((option, index) => (
        <ToggleElement key={id + '-' + index} isActive={index === activeIndex} onClick={() => toggle(index)}>
          {option}
        </ToggleElement>
      ))}
    </ToggleWrapper>
  )
}
