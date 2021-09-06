import { gql } from '@apollo/client/core'
import { blockClient } from 'apollo/client'
import dayjs from 'dayjs'

const BLOCK_QUERY = gql`
  query block($timestampMin: Int, $timestampMax: Int) {
    blocks(
      first: 1
      where: { timestamp_gt: $timestampMin, timestamp_lt: $timestampMax }
      orderBy: timestamp
      orderDirection: asc
    ) {
      number
    }
  }
`
export default async function getBlockNumDaysAgo(numDays: number): Promise<number> {
  const timestampMin = dayjs().subtract(numDays, 'day').unix()
  const timestampMax = timestampMin + 300
  const result = await blockClient.query({
    query: BLOCK_QUERY,
    variables: {
      timestampMin,
      timestampMax,
    },
  })

  return Number(result.data.blocks[0].number)
}
