import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'
import React from 'react'
import styled from 'styled-components'
import { useIsDarkMode } from 'state/user/hooks'
import { colors as getColors } from 'theme'

const Wrapper = styled.div<{ width: number }>`
  width: ${(props) => props.width}px;
`

// style options described here: https://material-ui.com/api/slider/#css
const useStyles = makeStyles((theme) => {
  return {
    root: {
      color: '#2172E5',
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
    valueLabel: {
      // left: 'calc(-50% + 4px)',
    },
    track: (props: any) => ({
      height: 6,
      borderRadius: 6,
      backgroundColor: props.blue1,
    }),
    trackDisabled: (props: any) => ({
      height: 6,
      borderRadius: 6,
      backgroundColor: props.text3,
    }),
    rail: (props: any) => ({
      height: 6,
      borderRadius: 6,
      backgroundColor: props.bg3,
      opacity: 1,
    }),
    margin: {
      // height: '50px',
      '& .MuiSlider-thumb': {
        // disabled styles for thumb
        marginTop: -8,
        marginLeft: -8,
        height: 20,
        width: 20,
      },
    },
    mark: (props: any) => ({
      backgroundColor: props.pink1,
      height: 24,
      // width: 2,
      marginTop: -10,
    }),
    markLabel: (props: any) => ({
      marginTop: 14,
      color: props.text2,
    }),
  }
})

interface Mark {
  value: number
  label: string
}
interface Props extends React.ImgHTMLAttributes<HTMLDivElement> {
  min: number
  max: number
  step?: number
  defaultValue?: number
  size?: number
  width?: number
  onChange?: any
  value?: number[]
  defaultValues?: number[]
  marks?: Mark[]
  disabled?: boolean
}

function valuetext(value: number) {
  return `${value}`
}

export default function RangeSelector({
  min,
  max,
  step,
  width = 100,
  defaultValues = [0, 0],
  onChange,
  value,
  marks = [],
  disabled,
  ...rest
}: Props) {
  const isDarkMode = useIsDarkMode()
  const colors = getColors(isDarkMode)
  const classes = useStyles(colors)

  return (
    <Wrapper width={width}>
      <Slider
        min={min}
        max={max}
        valueLabelFormat={(value) => value.toFixed(4)}
        value={value}
        getAriaValueText={valuetext}
        aria-labelledby="discrete-slider-small-steps"
        step={step}
        marks={marks}
        // valueLabelDisplay="off"
        onChange={onChange}
        disabled={disabled}
        classes={{
          root: classes.root, // class name, e.g. `classes-nesting-root-x`
          track: disabled ? classes.trackDisabled : classes.track, // class name, e.g. `classes-nesting-label-x`
          thumb: disabled ? classes.thumbDisabled : classes.thumb,
          rail: classes.rail,
          mark: classes.mark,
          markLabel: classes.markLabel,
        }}
      />
    </Wrapper>
  )
}
