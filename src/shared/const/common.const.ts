import { Chain } from 'wagmi/chains';
import { EnvEnum } from '../interfaces';

export const TokenCacheKey = '_mint_forest_token_prod_v1';

export const BaseApi = 'https://api.mintforest.io';

export function isFrontProd() {
  return process.env.NEXT_PUBLIC_ENV === EnvEnum.Prod;
}

export function shouldMintChain() {
  return isFrontProd() ? MintMainNet : MintTestnet;
}

export const MintTestChain = {
  TestnetExplorer: 'https://sepolia-testnet-explorer.mintchain.io',
  RpcUrl: 'https://sepolia-testnet-rpc.mintchain.io',
  Bridge: 'https://bridge.mintchain.io',
  Swap: 'https://beta.mintswap.finance',
};

export const MintMainChain = {
  MainnetExplorer: 'https://explorer.mintchain.io',
  RpcUrl: 'https://rpc.mintchain.io',
  Bridge: 'https://bridge.mintchain.io',
  Swap: 'https://www.mintswap.finance',
};

export const MintTestnet: Chain = {
  id: 1687,
  name: 'Mint Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [MintTestChain.RpcUrl] },
  },
  blockExplorers: {
    default: {
      name: 'Mint Testnet',
      url: MintTestChain.TestnetExplorer,
    },
  },
} as const satisfies Chain;

export const MintMainNet: Chain = {
  id: 185,
  name: 'Mint Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [MintMainChain.RpcUrl] },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: MintMainChain.MainnetExplorer,
    },
  },
};

export const ForestContract =
  process.env.NEXT_PUBLIC_ENV === 'production'
    ? '0x12906892aaa384ad59f2c431867af6632c68100a'
    : '0x12906892aaa384ad59f2c431867af6632c68100a';

export const ForestNewsKey = '_me_forest_news';
