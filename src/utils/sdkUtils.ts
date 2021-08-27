import { Pool } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'

interface TokenRaw {
  id: string
  decimals: string
}

export interface RawPoolData {
  token0: TokenRaw
  token1: TokenRaw
  feeTier: string
  liquidity: string
  sqrtPrice: string
  tick: string
}

export function getPool(rawPool: RawPoolData): Pool {
  return new Pool(
    new Token(1, rawPool.token0.id, parseInt(rawPool.token0.decimals)),
    new Token(1, rawPool.token1.id, parseInt(rawPool.token1.decimals)),
    parseInt(rawPool.feeTier),
    parseInt(rawPool.sqrtPrice),
    parseInt(rawPool.liquidity),
    parseInt(rawPool.tick)
  )
}
