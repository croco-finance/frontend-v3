import React, { ReactNode } from 'react'
import styled from 'styled-components'

const Feature = styled.section<{ flip?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: ${(props) => (props.flip === true ? 'row-reverse' : 'row')};
  overflow: hidden;
  padding: 40px 0;
  text-align: 'left' !important;
  max-width: 1200px;
  min-height: 360px;

  & + & {
    border-top: 1px solid ${(props) => props.theme.text5};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
  flex-direction: column;
  `};
`

const StyledText = styled.div<{ flip?: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 50%;
  text-align: left;
  padding: 20px 60px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    padding: 10px 20px;
 `};
`

const ImageWrapper = styled.div`
  padding: 20px 40px;
  width: 50%;
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding: 10px 20px;
  `};
`
const FeatureImage = styled.img<{ size: number; sizeSmall: number }>`
  height: ${(props) => props.size}px;
  display: block;
`

interface Props {
  children: ReactNode
  flip?: boolean
  imageSize: number
  imageSizeSmall: number
  image: string
}

const Index = ({ children, flip, image, imageSize, imageSizeSmall }: Props) => (
  <Feature flip={flip}>
    <StyledText flip={flip}>{children}</StyledText>
    <ImageWrapper>
      <FeatureImage src={image} size={imageSize} sizeSmall={imageSizeSmall} />
    </ImageWrapper>
  </Feature>
)

export default Index
