import CommonButton from '@/shared/components/common-button.component';
import CommonImg from '@/shared/components/common-img.component';
import LoadMore from '@/shared/components/loadmore/loadmore.component';
import { AuthType, BaseModalStyle, TokenCacheKey } from '@/shared/const';
import { useAlert, useAxios, useClientAccount, useGlobalStore } from '@/shared/hooks';
import { useSearchUser } from '@/shared/hooks/use-search-user';
import { getContractErrorMsg } from '@/shared/services/ethers.service';
import { NotifyEvent, notifyService } from '@/shared/services/notify.service';
import { ArrowSvg } from '@/shared/svg';
import { clearLocalStorage, getLocalStorage, getSignMessage, isEmpty, setLocalStorage } from '@/shared/utils';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/router';
import { FC, useEffect, useRef, useState } from 'react';
import { useSignMessage } from 'wagmi';

interface LoginInterface {}

const Login: FC<LoginInterface> = (props) => {
  const currentAddressRef = useRef('');
  const { pageStatus, token, userInfo, setState } = useGlobalStore();
  const { isReady, query } = useRouter();
  const alert = useAlert();
  const { address } = useClientAccount();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  const [loadStatus, setLoadStatus] = useState(false);
  const autoComplete = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const logout = (address: string) => {
    console.warn(`======[${address} logout]======`);
    clearLocalStorage(TokenCacheKey, address);
    setState({ token: '', pageStatus: 'login', userInfo: undefined });
  };

  const { run: queryUserInfo } = useAxios(
    () => {
      return {
        url: '/api/forest/normal/getUserInfo',
        method: 'get',
      };
    },
    {
      onSuccess: (res: any) => {
        res.infoType = 'mine';
        if (autoComplete.current) {
          setLoadStatus(false);
          setState({ userInfo: res, pageStatus: 'complete' });
        } else {
          setState({ userInfo: res });
        }
      },
      onError: (err: any) => {
        alert.error(err.msg);
        setLoadStatus(false);
      },
    }
  );

  const { run: loginRequest } = useAxios(
    (wallet_address: string, signature: string, message: string, invitation_code?: string) => {
      return {
        url: `/api/forest/user/auth`,
        method: 'post',
        data: {
          wallet_address,
          signature,
          message,
          invitation_code,
        },
      };
    },
    {
      authType: AuthType.Ignored,
      onSuccess: (data: any) => {
        setState({ token: data });
        setLocalStorage(TokenCacheKey, address as any, data);
      },
      onError: () => {
        setLoadStatus(false);
      },
    }
  );

  const { run: queryOtherUserInfo, loading } = useSearchUser({
    onSuccess: (res: any) => {
      res.infoType = 'other';
      setState({ otherUserInfo: res, pageStatus: 'complete' });
    },
  });

  const onLoginClick = (useInviteCode: boolean) => {
    if (token) {
      if (userInfo) {
        setLoadStatus(false);
        setState({ pageStatus: 'complete' });
      } else {
        autoComplete.current = true;
        setLoadStatus(true);
      }
      return;
    }

    if (isEmpty(address)) {
      openConnectModal && openConnectModal();
      return;
    }

    setLoadStatus(true);
    const signMessage = getSignMessage(address);
    signMessageAsync({ message: signMessage })
      .then((signature: string) => {
        autoComplete.current = true;

        const inviteCode = inputRef.current ? inputRef.current.value : '';

        loginRequest(address, signature, signMessage, useInviteCode ? inviteCode : '');
      })
      .catch((error: any) => {
        alert.error(getContractErrorMsg(error));
        setLoadStatus(false);
      });
  };

  useEffect(() => {
    if (isEmpty(address)) return;

    const cache = getLocalStorage(TokenCacheKey, address);
    // console.log('-cache-', address, cache, currentAddressRef.current);

    if (!cache || (!isEmpty(currentAddressRef.current) && currentAddressRef.current != address)) {
      logout(currentAddressRef.current);
    } else {
      setState({ token: cache });
      autoComplete.current = false;
    }

    currentAddressRef.current = address;
  }, [address]);

  useEffect(() => {
    if (!token) return;
    queryUserInfo();
  }, [token]);

  useEffect(() => {
    if (!isReady || !query) return;

    if (query.id) {
      queryOtherUserInfo(query.id);
    }

    if (query.inviteCode) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.value = query.inviteCode as string;
        }
      }, 300);
    }
  }, [isReady, query]);

  useEffect(() => {
    const notify = notifyService.subscribe([
      {
        name: NotifyEvent.USER_INFO_REFRESH,
        callback: () => {
          queryUserInfo();
        },
      },
      {
        name: NotifyEvent.LOGIN_REFRESH,
        callback: () => {
          logout(currentAddressRef.current as any);
        },
      },
    ]);

    return () => {
      notify.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        className={'w-full h-full absolute left-0 top-0 z-50 flex items-center justify-center'}
        style={BaseModalStyle.overlay}
      >
        <LoadMore className="!w-[56px]" color="#FFF" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {pageStatus == 'login' && (
        <motion.div
          className={
            'w-full h-full bg-[rgba(0,0,0,0.7)] absolute left-0 top-0 flex flex-col items-center justify-center'
          }
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-[90vw] h-[26vw] lg:w-[422px] lg:h-[120px]">
            <CommonImg
              local
              className="absolute-center max-w-[unset] w-[98vw] lg:w-[572px]"
              src={'/images/mint-forest-title.png'}
              alt={'title'}
            />
          </div>

          <div
            className="w-[132px] h-1 mb-8"
            style={{
              background:
                'linear-gradient(90deg, rgba(255, 255, 255, 0.00) 0%, #32FF35 50.5%, rgba(255, 255, 255, 0.00) 100%)',
            }}
          />
          <span className="text-lg w-[88vw] lg:w-[600px] text-center text-white">
            In MintForest, you can develop diverse forest landscapes and create your own green paradise!Plant, nurture,
            and upgrade—each forest is unique, full of surprises and rewards.
          </span>
          {!token && (
            <>
              <div
                className="w-[75vw] lg:w-[400px] h-28 rounded-3xl bg-[#FFEFBE] mt-8 mb-10 lg:mb-8 flex items-center justify-center "
                style={{
                  boxShadow:
                    '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset',
                }}
              >
                <input
                  ref={inputRef}
                  className="w-full h-[42px] leading-[42px] px-8 text-text-lv1 text-[24px] font-semibold bg-transparent outline-none text-center placeholder:font-semibold placeholder:text-lg placeholder:text-[#CEA27A] placeholder:-translate-y-1"
                  type="text"
                  placeholder="Invite Code"
                />
              </div>
              {address && (
                <span
                  className="text-md lg:text-lg text-primary cursor-pointer font-semibold"
                  onClick={() => onLoginClick(false)}
                >
                  Enter directly without using a referral code
                </span>
              )}
            </>
          )}
          <CommonButton
            className="group !h-28 !rounded-[28px] !bg-white flex items-center !text-black !border-none justify-center gap-4 px-16 cursor-pointer transition-all mt-12 lg:mt-8"
            onClick={() => onLoginClick(true)}
            loading={loadStatus}
          >
            {!token ? (
              <span className="text-lg font-semibold">{address ? 'Login' : 'CONNECT WALLET'}</span>
            ) : (
              <span className="text-lg font-semibold">Explore</span>
            )}
            <ArrowSvg className={'transition-all group-hover:translate-x-2'} />
          </CommonButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Login;
