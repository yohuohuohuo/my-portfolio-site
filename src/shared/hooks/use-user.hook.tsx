import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { energyToLevel, isEmpty } from '../utils';
import { useGlobalStore } from './use-global-store.hook';
import { useShallow } from 'zustand/react/shallow';
import { useGlobalConfig } from './use-global-config.hook';

export const useOtherIndex = () => {
  const {
    query: { id },
  } = useRouter();

  const { userInfo, otherUserInfo } = useGlobalStore(
    useShallow((state) => ({ userInfo: state.userInfo, otherUserInfo: state.otherUserInfo }))
  );

  return useMemo(() => {
    if (userInfo && otherUserInfo) {
      return userInfo.greenId !== otherUserInfo.greenId;
    }

    if (!isEmpty(id)) {
      return true;
    }

    return false;
  }, [userInfo, otherUserInfo, id]);
};

export const useCurrentUserInfo = () => {
  const { userInfo, otherUserInfo } = useGlobalStore(
    useShallow((state) => ({ userInfo: state.userInfo, otherUserInfo: state.otherUserInfo }))
  );

  return useMemo(() => {
    return otherUserInfo || userInfo;
  }, [userInfo, otherUserInfo]);
};

export const useCurrentLevel = () => {
  const currentUser = useCurrentUserInfo();
  const lvConfig = useGlobalConfig(useShallow((state) => state.levelConfig));

  const currentLevel = useMemo(() => {
    if (!lvConfig || !currentUser) return 0;
    return energyToLevel(lvConfig, Number(currentUser.mfTotalAmounts));
  }, [lvConfig, currentUser]);

  return currentLevel;
};
