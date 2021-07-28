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
  grid-template-rows: repeat(${(props) => props.rowsCount}, 28px);
  color: ${({ theme }) => theme.text3};
  overflow-y: auto;
`

const RowItem = styled.div``
const HeadlineLabel = styled.div`
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.text1};
  margin-bottom: 8px;
`

const Right = styled(RowItem)`
  justify-self: end;
`

export type InteractionsProps = {
  interactions: Interaction[] | undefined
  token0Symbol: string | undefined
  token1Symbol: string | undefined
}

const Interactions = ({ interactions, token0Symbol, token1Symbol }: InteractionsProps) => {
  const chainId = 1

  const getInteractionTypeLabel = (interactionType: Interaction['type']) => {
    if (interactionType === 0) return 'Deposit'
    if (interactionType === 1) return 'Withdraw'
    return 'Fees collected'
  }

  return (
    <Wrapper>
      <Label>Transactions</Label>
      {interactions ? (
        <Content rowsCount={interactions.length + 1}>
          <HeadlineLabel>Date</HeadlineLabel>
          <HeadlineLabel>Action</HeadlineLabel>
          <Right>
            <HeadlineLabel>USD Value</HeadlineLabel>
          </Right>
          <Right>
            <HeadlineLabel>{token0Symbol}</HeadlineLabel>
          </Right>
          <Right>
            <HeadlineLabel>{token1Symbol}</HeadlineLabel>
          </Right>

          {interactions.map((interaction) => (
            <>
              <RowItem>
                <ExternalLink href={getExplorerLink(chainId, interaction.transaction.id, ExplorerDataType.TRANSACTION)}>
                  {dayjs(interaction.transaction.timestamp * 1000).format('MMM D, YYYY')} ↗
                </ExternalLink>
              </RowItem>
              <RowItem>{getInteractionTypeLabel(interaction.type)}</RowItem>
              <Right>{formatDollarAmount(interaction.valueUSD)}</Right>
              <Right>{formatAmount(interaction.amountToken0)}</Right>
              <Right>{formatAmount(interaction.amountToken1)}</Right>
            </>
          ))}
        </Content>
      ) : (
        <Loader />
      )}
    </Wrapper>
  )
}

export default Interactions
