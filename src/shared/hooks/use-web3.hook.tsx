import { RainbowKitProvider, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  coin98Wallet,
  coinbaseWallet,
  imTokenWallet,
  metaMaskWallet,
  okxWallet,
  rainbowWallet,
  tokenPocketWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';
import { WagmiProvider, cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { MintMainNet, MintTestnet, shouldMintChain } from '../const';

const projectId = 'b539babbebcc466f52e8f61f061e4e33';

const queryClient = new QueryClient();

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, imTokenWallet, okxWallet, tokenPocketWallet, coin98Wallet],
    },
    {
      groupName: 'Suggested',
      wallets: [walletConnectWallet, coinbaseWallet, rainbowWallet],
    },
  ],
  { appName: 'MintForest', projectId: projectId }
);

export const connectConfig = createConfig({
  connectors,
  chains: [MintMainNet, MintTestnet],
  transports: {
    [MintMainNet.id]: http(),
    [MintTestnet.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

interface RainbowRootInterface {}

const RainbowRoot: FC<RainbowRootInterface & PropsWithChildren> = (props) => {
  return (
    <WagmiProvider config={connectConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} locale="en-US" initialChain={connectConfig.chains[0]}>
          {props.children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RainbowRoot;
