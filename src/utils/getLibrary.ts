import { Web3Provider } from '@ethersproject/providers'

export default function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(
    provider,
    // eslint-disable-next-line no-nested-ternary
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? // eslint-disable-next-line radix
        parseInt(provider.chainId)
      : 'any'
  )
  // TODO: this should depend on the network block time
  library.pollingInterval = 15_000
  return library
}
