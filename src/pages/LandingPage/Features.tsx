import DailyFees from '../../assets/images/landing-page/daily-fees.svg'
import ImpermanentLoss from '../../assets/images/landing-page/impermanent-loss.svg'
import SimulatorImage from '../../assets/images/landing-page/simulator.svg'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Feature from './Feature'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1080px;
`

const FeaturesWrapper = styled.div`
  margin: 60px 0 0 0;
  & > section {
    padding: 30px 0;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-top: 20px;
  `};
`

const StyledH1 = styled.h1<{ textAlign: string }>`
  font-size: 22px;
  line-height: 36px;
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.text1};
  padding-left: ${(props) => (props.textAlign === 'right' ? '20px' : '0')};
  margin-bottom: 0px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    line-height: 40px;
    white-space: pre-wrap;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0;
  font-size: 22px;
  `};
`

const StyledP = styled.p<{ textAlign: string }>`
  font-size: 18px;
  line-height: 34px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text2};
  padding-left: ${(props) => (props.textAlign === 'right' ? '20px' : '0')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0;
  `};
`

const SimulatorButton = styled(Link)`
  cursor: pointer;
  text-decoration: none;
  padding: 8px;
  border-radius: 5px;
  border: none;
  color: white;
  background-color: ${({ theme }) => theme.blue1};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  width: 70px;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: end;
`

const Features = () => {
  return (
    <Wrapper>
      <FeaturesWrapper>
        <Feature image={DailyFees} imageSize={260} imageSizeSmall={150} flip={false}>
          <StyledH1 textAlign="left">Track your fee rewards</StyledH1>
          <StyledP textAlign="left">See how much fees is your position earning every day.</StyledP>
        </Feature>

        <Feature image={ImpermanentLoss} imageSize={120} imageSizeSmall={170} flip>
          <StyledH1 textAlign="left">Impermanent loss</StyledH1>
          <StyledP textAlign="left">
            {'Check how is your position performing compared to just holding deposited tokens.'}
          </StyledP>
        </Feature>

        <Feature image={SimulatorImage} imageSize={260} imageSizeSmall={170} flip={false}>
          <StyledH1 textAlign="left">Simulator</StyledH1>
          <StyledP textAlign="left">Set concrete token prices and see how it affects your position.</StyledP>
          <SimulatorButton
            to={{
              pathname: `/simulator`,
            }}
          >
            Open
          </SimulatorButton>
        </Feature>
      </FeaturesWrapper>
    </Wrapper>
  )
}

export default Features
