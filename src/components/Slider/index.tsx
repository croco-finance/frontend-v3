import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'
import { useIsDarkMode } from 'state/user/hooks'
import React from 'react'
import styled from 'styled-components'
import { colors as getColors } from 'theme'

const Wrapper = styled.div<{ width: number }>`
  width: ${(props) => props.width}px;
`
// TODO check if the colors argument is passed and how does it work
const useStyles = makeStyles((theme) => ({
  root: {
    height: 0,
  },
  thumb: (props: any) => ({
    height: 20,
    width: 20,
    marginTop: -8,
    marginLeft: -8,
    backgroundColor: props.blue1,
    '&:focus, &:hover, &active': {
      boxShadow: 'inherit',
    },
  }),
  thumbDisabled: (props: any) => ({
    backgroundColor: props.text2,
  }),
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
    display: 'none',
  },
  track: (props: any) => ({
    height: 6,
    borderRadius: 6,
    backgroundColor: props.bg3,
    opacity: 1,
  }),
  rail: (props: any) => ({
    height: 6,
    borderRadius: 6,
    backgroundColor: props.bg3,
    opacity: 1,
  }),
  trackDisabled: (props: any) => ({
    height: 6,
    borderRadius: 6,
    backgroundColor: props.text3,
  }),
}))

interface Props extends React.ImgHTMLAttributes<HTMLDivElement> {
  min: number
  max: number
  step?: number
  defaultValue?: number
  size?: number
  width?: number
  onChange?: any
  value?: number
  disabled?: boolean
}

const MaterialSlider = ({ min, max, step, width = 100, defaultValue = 0, onChange, value, disabled }: Props) => {
  const isDarkMode = useIsDarkMode()
  const colors = getColors(isDarkMode)
  const classes = useStyles(colors)

  return (
    <Wrapper width={width}>
      <Slider
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="off"
        defaultValue={defaultValue}
        onChange={onChange}
        value={value}
        disabled={disabled}
        classes={{
          root: classes.root, // class name, e.g. `classes-nesting-root-x`
          track: disabled ? classes.trackDisabled : classes.track, // class name, e.g. `classes-nesting-label-x`
          thumb: disabled ? classes.thumbDisabled : classes.thumb,
          rail: classes.rail,
        }}
      />
    </Wrapper>
  )
}

export default MaterialSlider
