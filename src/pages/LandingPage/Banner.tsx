import BannerImage from '../../assets/images/landing-page/landing-page-text-dark.svg'
import React from 'react'
import styled from 'styled-components'

const SvgWrapper = styled.img`
  display: inline-block;
  max-height: ${(props) => props.height}px;
  div {
    max-height: ${(props) => props.height}px;
    line-height: ${(props) => props.height}px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
  max-height: 110px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  max-height:75px;
  `};
`

const Banner = () => {
  return <SvgWrapper height={160} src={BannerImage} />
}

export default Banner
