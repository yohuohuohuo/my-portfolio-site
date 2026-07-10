import { useEffect, useState } from 'react';
import { Config, UseAccountReturnType, useAccount } from 'wagmi';

export const useClientAccount = () => {
  const {
    address,
    addresses,
    chain,
    chainId,
    connector,
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting,
    status,
  } = useAccount();
  const [account, setAccount] = useState<UseAccountReturnType<Config>>();

  useEffect(() => {
    setAccount({
      address,
      addresses,
      chain,
      chainId,
      connector,
      isConnected,
      isConnecting: isConnecting as any,
      isDisconnected: isDisconnected as any,
      isReconnecting: isReconnecting as any,
      status: status as any,
    });
  }, [
    address,
    addresses,
    chain,
    chainId,
    connector,
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting,
    status,
  ]);

  return account || ({} as UseAccountReturnType<Config>);
};
