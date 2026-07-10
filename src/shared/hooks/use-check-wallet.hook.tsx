import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { useSwitchChain } from 'wagmi';
import { isEmpty } from '../utils';
import { useClientAccount } from './use-client-address.hook';

export const useCheckWallet = (chainId: number) => {
  const { address, chainId: currentChainId } = useClientAccount();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const [valid, setValid] = useState(true);
  const { switchChainAsync } = useSwitchChain();

  const check = (callback?: Function) => {
    if (!address && openConnectModal) {
      openConnectModal();
      return;
    }

    if (!currentChainId || currentChainId !== chainId) {
      openChainModal && openChainModal();
      return;
    }

    callback && callback();
  };

  const checkAndSwitch = (callback?: Function) => {
    if (!address && openConnectModal) {
      openConnectModal();
      callback && callback(false);
      return;
    }

    if (!currentChainId || currentChainId !== chainId) {
      switchChainAsync({ chainId: chainId })
        .then((res) => {
          callback && callback(true);
        })
        .catch(() => {
          callback && callback(false);
        });
      return;
    }

    callback && callback(true);
  };

  useEffect(() => {
    if (currentChainId && address) {
      setValid(chainId === currentChainId && !isEmpty(address));
    }
  }, [address, currentChainId, chainId]);

  return { valid, check, checkAndSwitch };
};
