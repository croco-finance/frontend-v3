import useTheme from 'hooks/useTheme'
import React from 'react'
import ReactSelect, { Props as SelectProps } from 'react-select'
import styled from 'styled-components'

const selectStyle = (
  isSearchable: boolean,
  withDropdownIndicator = true,
  variant: 'small' | 'large',
  usePointerCursor: boolean,
  fontFamily: string,
  noBorder: boolean,
  useLightBackground: boolean,
  useDarkBorder: boolean,
  theme: any,
  maxDropdownHeight: string
): any => ({
  singleValue: (base: Record<string, any>) => ({
    ...base,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    color: theme.text0,
    fontWeight: theme.fontWeight.demiBold,
    fontSize: theme.fontSize.normal,
    // explicitly define font-family because elements in <ReactSelect/> can inherit some other fonts unexpectedly
    fontFamily: `${fontFamily} !important`,
    '&:hover': {
      cursor: usePointerCursor || !isSearchable ? 'pointer' : 'text',
    },
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '2px 8px',
  }),
  control: (base: Record<string, any>, { isDisabled, isFocused }: { isDisabled: boolean; isFocused: boolean }) => ({
    ...base,
    minHeight: 'initial',
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.fontSize.small,
    height: variant === 'small' ? '36px' : '48px',
    borderRadius: '10px',
    borderWidth: noBorder ? 0 : '2px',
    borderColor: useDarkBorder ? theme.bg5 : theme.bg2,
    boxShadow: 'none',
    backgroundColor: useLightBackground ? theme.bg1 : theme.bg0,
    '&:hover, &:focus': {
      cursor: 'pointer',
      borderRadius: '10px',
      borderColor: theme.blue1,
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base: Record<string, any>, { isDisabled }: { isDisabled: boolean }) => ({
    ...base,
    display: !withDropdownIndicator || isDisabled ? 'none' : 'flex',
    alignItems: 'center',
    color: theme.text2,
    path: '',
    '&:hover': {
      color: theme.blue1,
    },
  }),
  menu: (base: Record<string, any>) => ({
    ...base,
    margin: '5px 0',
    // boxShadow: 'box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.15)',
    zIndex: 9,
    borderRadius: '10px',
    border: `2px solid ${theme.blue1}`,
    backgroundColor: theme.bg1,
  }),
  menuList: (base: Record<string, any>) => ({
    ...base,
    padding: 0,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    background: theme.black,
    borderRadius: '10px',
    maxHeight: maxDropdownHeight,
    '::-webkit-scrollbar': {
      backgroundColor: theme.SCROLLBAR_BACKGROUND,
      width: '8px',
      borderRadius: '10px',
    },
    /* background of the scrollbar except button or resizer */
    '::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    /* scrollbar itself */
    '::-webkit-scrollbar-thumb': {
      /* 7F7F7F for mac-like color */
      backgroundColor: theme.SCROLLBAR_THUMB,
      borderRadius: '10px',
      border: `1px solid ${theme.SCROLLBAR_THUMB}`,
    },

    '::-webkit-scrollbar-thumb:hover': {
      /* 7F7F7F for mac-like color */
      backgroundColor: theme.SCROLLBAR_THUMB_HOVER,
      border: `1px solid ${theme.SCROLLBAR_THUMB_HOVER_BORDER}`,
    },

    /* set button(top and bottom of the scrollbar) */
    '::-webkit-scrollbar-button': {
      display: 'none',
    },
  }),
  option: (base: Record<string, any>, { isFocused }: { isFocused: boolean }) => ({
    ...base,
    color: theme.text2,
    fontWeight: theme.fontWeight.medium,
    // background: isFocused ? theme.bg0 : theme.bg2,
    background: theme.bg1,
    borderRadius: 0,
    fontSize: theme.fontSize.normal,
    fontFamily: `${fontFamily} !important`,
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.bg3,
    },
  }),
  input: (base: Record<string, any>) => ({
    ...base,
    fontSize: theme.fontSize.normal,
    color: theme.text0,
    '& input': {
      fontFamily: `${fontFamily} !important`,
    },
  }),
  placeholder: (base: Record<string, any>) => ({
    ...base,
    color: theme.text3,
    fontWeight: theme.fontWeight.medium,
    fontSize: theme.fontSize.normal,
    padding: '2px 8px',
  }),
})

const Wrapper = styled.div<Props>`
  width: ${(props) => (props.width ? `${props.width}px` : '100%')};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

interface Props extends Omit<SelectProps, 'components'> {
  withDropdownIndicator?: boolean
  label?: React.ReactNode
  wrapperProps?: Record<string, any>
  variant?: 'small' | 'large'
  usePointerCursor?: boolean
  fontFamily?: string
  noBorder?: boolean
  useLightBackground?: boolean
  useDarkBorder?: boolean
  maxDropdownHeight?: string
}

const Select = ({
  isSearchable = true,
  usePointerCursor = false,
  withDropdownIndicator = true,
  wrapperProps,
  label,
  width,
  variant = 'large',
  fontFamily = 'Inter var',
  noBorder = false,
  useLightBackground = false,
  useDarkBorder = false,
  maxDropdownHeight = '260px',
  ...props
}: Props) => {
  const theme = useTheme()
  const styles = selectStyle(
    isSearchable,
    withDropdownIndicator,
    variant,
    usePointerCursor,
    fontFamily,
    noBorder,
    useLightBackground,
    useDarkBorder,
    theme,
    maxDropdownHeight
  )
  return (
    <Wrapper width={width} {...wrapperProps}>
      <ReactSelect styles={styles} isSearchable={isSearchable} {...props} components={{ ...props.components }} />
    </Wrapper>
  )
}

export default Select
