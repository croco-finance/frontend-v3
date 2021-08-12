import { LightCard } from 'components/Card'
import { Interaction } from 'data/dashboard/expandedData'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React from 'react'
import styled from 'styled-components'
import { ExternalLink } from 'theme'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { ExplorerDataType, getExplorerLink } from '../../../../../utils/getExplorerLink'
import Loader from 'components/Loader'

dayjs.extend(utc)

const Wrapper = styled(LightCard)`
  width: 100%;
  height: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

const Label = styled.div`
  display: flex;
  font-size: 16px;
  align-items: center;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.text3};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`

const Content = styled.div<{ rowsCount: number }>`
  display: grid;
  grid-template-columns: minmax(140px, 25%) minmax(110px, 21%) minmax(110px, 18%) minmax(110px, 18%) minmax(110px, 18%);
  grid-template-rows: repeat(${(props) => props.rowsCount}, 34px);
  color: ${({ theme }) => theme.text3};
  overflow-y: auto;
`

const RowItem = styled.div<{ hideBorder: boolean }>`
  align-items: center;
  width: 100%;
  display: flex;
  border-top: ${(props) => (props.hideBorder ? 'none' : `1px solid ${props.theme.text5}`)};
`
const Left = styled(RowItem)`
  justify-content: flex-start;
`

const Right = styled(RowItem)`
  justify-content: flex-end;
`

const LeftHeadlineLabel = styled(Left)`
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text1};
  margin-bottom: 8px;
`

const RightHeadlineLabel = styled(Right)`
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text1};
  margin-bottom: 8px;
`

export type InteractionsProps = {
  interactions: Interaction[] | undefined
  token0Symbol: string | undefined
  token1Symbol: string | undefined
}

const getInteractionTypeLabel = (interactionType: Interaction['type']) => {
  if (interactionType === 0) return 'Deposit'
  if (interactionType === 1) return 'Withdraw'
  return 'Fees collected'
}

const Interactions = ({ interactions, token0Symbol, token1Symbol }: InteractionsProps) => {
  const chainId = 1

  // iterate over interactions and if there is "wWITHDRAW" and "COLLECT" witht he same tx.id going after each other, save the index
  const indexesWithoutTopBorder: number[] = []
  let previousTxId = ''
  interactions?.forEach((interaction, i) => {
    if (interaction.transaction.id === previousTxId) {
      indexesWithoutTopBorder.push(i)
    }
    previousTxId = interaction.transaction.id
  })

  return (
    <Wrapper>
      <Label>Transactions</Label>
      {interactions ? (
        <Content rowsCount={interactions.length + 1}>
          <LeftHeadlineLabel hideBorder>Date</LeftHeadlineLabel>
          <LeftHeadlineLabel hideBorder>Action</LeftHeadlineLabel>
          <RightHeadlineLabel hideBorder>USD Value</RightHeadlineLabel>
          <RightHeadlineLabel hideBorder>{token0Symbol}</RightHeadlineLabel>
          <RightHeadlineLabel hideBorder>{token1Symbol}</RightHeadlineLabel>

          {interactions.map((interaction, i) => {
            const hideTopBorder = indexesWithoutTopBorder.includes(i)
            return (
              <React.Fragment key={i}>
                <Left hideBorder={hideTopBorder}>
                  {hideTopBorder ? (
                    ''
                  ) : (
                    <ExternalLink
                      href={getExplorerLink(chainId, interaction.transaction.id, ExplorerDataType.TRANSACTION)}
                    >
                      {dayjs(interaction.transaction.timestamp * 1000).format('MMM D, YYYY')} ↗
                    </ExternalLink>
                  )}
                </Left>
                <Left hideBorder={indexesWithoutTopBorder.includes(i)}>
                  {getInteractionTypeLabel(interaction.type)}
                </Left>
                <Right hideBorder={hideTopBorder}>{formatDollarAmount(interaction.valueUSD)}</Right>
                <Right hideBorder={hideTopBorder}>{formatAmount(interaction.amountToken0)}</Right>
                <Right hideBorder={hideTopBorder}>{formatAmount(interaction.amountToken1)}</Right>
              </React.Fragment>
            )
          })}
        </Content>
      ) : (
        <Loader />
      )}
    </Wrapper>
  )
}

export default Interactions
