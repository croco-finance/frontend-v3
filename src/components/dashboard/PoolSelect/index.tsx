import Badge from 'components/Badge'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import Select from 'components/Select'
import React from 'react'
import { PositionData } from 'state/dashboard/reducer'
import styled from 'styled-components'
import { TYPE } from 'theme'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 30px;
`

const LogoWrapper = styled.div`
  padding-right: 10px;
  display: flex;
  align-items: center;
`

export interface PoolOption {
  value:
    | {
        pool: string
        feeTier: number
        symbolToken0: string
        symbolToken1: string
        addressToken0: string
        addressToken1: string
      }
    | 'all'
  label: string
}

// const buildPoolOption = (pool: string, feeTier: string, symbolToken0: string, symbolToken1: string, addressToken0: string, addressToken1: string):PoolOption => {
//     return {
//         value: ,
//         label:`${pool}_${feeTier}`
//     };
// }

const buildPoolOptions = (positions: PositionData[] | undefined): PoolOption[] => {
  if (!positions) return []

  const uniquePools: string[] = [] // {address}_{feeTier}
  const poolOptions: PoolOption[] = []

  //   add option for ALL polss
  poolOptions.push({
    value: 'all',
    label: `All pools`,
  })

  positions.forEach((position) => {
    const { poolAddress } = position.overview
    const { fee, token0, token1 } = position.overview.pool
    if (!uniquePools.includes(`${poolAddress}_${fee}`)) {
      // console.log('uniquePools', `${poolAddress}_${pool.fee}`)
      // if pool not included yet
      poolOptions.push({
        value: {
          pool: poolAddress,
          feeTier: fee,
          symbolToken0: token0.symbol || '?',
          symbolToken1: token1.symbol || '?',
          addressToken0: token0.address,
          addressToken1: token1.address,
        },
        label: `${token0.symbol} / ${token1.symbol}; ${fee / 10000}%`,
      })

      // add this address + feeTier combination to pools we have used already
      uniquePools.push(`${poolAddress}_${fee}`)
    }
  })

  return poolOptions
}

const PoolOption = ({ value }: PoolOption) => {
  if (value === 'all') return <div style={{ paddingTop: '6px', paddingBottom: '6px' }}>All Pools</div>
  return (
    <OptionWrapper>
      <LogoWrapper>
        <DoubleCurrencyLogo size={20} address0={value.addressToken0} address1={value.addressToken1} />
      </LogoWrapper>
      {value.symbolToken0} / {value.symbolToken1}
      <Badge style={{ marginLeft: '10px' }}>
        <TYPE.main color={'white'} fontSize={11}>
          {value.feeTier / 10000}%
        </TYPE.main>
      </Badge>
    </OptionWrapper>
  )
}

interface Props {
  positions: PositionData[] | undefined
  onPoolSelect: any
  value: PoolOption
}

const PoolSelect = ({ positions, onPoolSelect, value }: Props) => {
  // TODO Select All Pools by default and show Loader when pools are being loaded
  const options = buildPoolOptions(positions)

  return (
    <Wrapper>
      <Select
        options={options}
        value={value}
        onChange={(option: PoolOption) => {
          onPoolSelect(option)
        }}
        placeholder="Select pool..."
        isSearchable={false}
        formatOptionLabel={PoolOption}
        useLightBackground
      />
    </Wrapper>
  )
}

export default PoolSelect
