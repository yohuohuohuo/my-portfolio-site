import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMintForestStore } from '../store/use-mint-forest-store';
import { useGlobalConfig } from './use-global-config.hook';
import { energyToLevel, isEmpty } from '@/shared/utils';

export const useOtherIndex = () => {
  const { query } = useRouter();
  const { userInfo, otherUserInfo } = useMintForestStore(
    useShallow((state) => ({ userInfo: state.userInfo, otherUserInfo: state.otherUserInfo })),
  );
  return useMemo(() => {
    if (userInfo && otherUserInfo) return userInfo.greenId !== otherUserInfo.greenId;
    return !isEmpty(query.id);
  }, [otherUserInfo, query.id, userInfo]);
};

export const useCurrentUserInfo = () => {
  const { userInfo, otherUserInfo } = useMintForestStore(
    useShallow((state) => ({ userInfo: state.userInfo, otherUserInfo: state.otherUserInfo })),
  );
  return useMemo(() => otherUserInfo || userInfo, [otherUserInfo, userInfo]);
};

export const useCurrentLevel = () => {
  const currentUser = useCurrentUserInfo();
  const levelConfig = useGlobalConfig((state) => state.levelConfig);
  return useMemo(() => {
    if (!currentUser || !levelConfig) return 0;
    return energyToLevel(levelConfig, Number(currentUser.mfTotalAmounts));
  }, [currentUser, levelConfig]);
};
