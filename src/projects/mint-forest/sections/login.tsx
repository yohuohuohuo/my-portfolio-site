import CommonButton from '@/shared/components/common-button.component';
import CommonImg from '@/shared/components/common-img.component';
import LoadMore from '@/shared/components/loadmore/loadmore.component';
import { BaseModalStyle } from '@/shared/const';
import { useAlert } from '@/shared/hooks';
import { useSearchUser } from '../hooks/use-search-user';
import { useMintForestStore } from '../store/use-mint-forest-store';
import { ArrowSvg } from '@/shared/svg';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/router';
import { FC, useEffect, useRef, useState } from 'react';

interface LoginInterface {}

const Login: FC<LoginInterface> = () => {
  const { isReady, query } = useRouter();
  const { hydrated, pageStatus, token, userInfo, hydrate, login, setState, setOtherUserInfo } = useMintForestStore();
  const alert = useAlert();
  const [loadStatus, setLoadStatus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { run: queryOtherUserInfo, loading } = useSearchUser({
    onSuccess: (data) => setOtherUserInfo(data),
  });

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  useEffect(() => {
    const inviteCode = typeof query.inviteCode === 'string' ? query.inviteCode : '';
    if (inputRef.current && inviteCode) inputRef.current.value = inviteCode;
  }, [query.inviteCode]);

  useEffect(() => {
    if (!isReady || !token || !query.id) return;
    const greenId = Array.isArray(query.id) ? query.id[0] : query.id;
    queryOtherUserInfo(greenId);
  }, [isReady, query.id, queryOtherUserInfo, token]);

  const onLoginClick = async () => {
    if (token && userInfo) {
      setState({ pageStatus: 'complete' });
      return;
    }

    setLoadStatus(true);
    const result = await login(inputRef.current?.value || '');
    setLoadStatus(false);
    if (!result.success) alert.error(result.msg || 'Unable to enter the local demo.');
  };

  if (loading) {
    return (
      <div className="w-full h-full absolute left-0 top-0 z-50 flex items-center justify-center" style={BaseModalStyle.overlay}>
        <LoadMore className="!w-[56px]" color="#FFF" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {hydrated && pageStatus === 'login' && (
        <motion.div
          className="w-full h-full bg-[rgba(0,0,0,0.7)] absolute left-0 top-0 flex flex-col items-center justify-center"
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-[90vw] h-[26vw] lg:w-[422px] lg:h-[120px]">
            <CommonImg
              local
              className="absolute-center max-w-[unset] w-[98vw] lg:w-[572px]"
              src="/projects/mint-forest/images/mint-forest-title.png"
              alt="Mint Forest"
            />
          </div>
          <div
            className="w-[132px] h-1 mb-8"
            style={{ background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.00) 0%, #32FF35 50.5%, rgba(255, 255, 255, 0.00) 100%)' }}
          />
          <span className="text-lg w-[88vw] lg:w-[600px] text-center text-white">
            In MintForest, you can develop diverse forest landscapes and create your own green paradise! Plant, nurture,
            and upgrade, each forest is unique, full of surprises and rewards.
          </span>
          {!token && (
            <div
              className="w-[75vw] lg:w-[400px] h-28 rounded-3xl bg-[#FFEFBE] mt-8 mb-10 lg:mb-8 flex items-center justify-center"
              style={{ boxShadow: '0px 4px 2px 0px #FFF inset, 0px 3px 6px 0px rgba(0, 0, 0, 0.30), 0px -4px 2px 0px #DEAE7B inset' }}
            >
              <input
                ref={inputRef}
                className="w-full h-[42px] leading-[42px] px-8 text-text-lv1 text-[24px] font-semibold bg-transparent outline-none text-center placeholder:font-semibold placeholder:text-lg placeholder:text-[#CEA27A]"
                type="text"
                placeholder="Invite Code"
              />
            </div>
          )}
          <CommonButton
            className="group !h-28 !rounded-[28px] !bg-white flex items-center !text-black !border-none justify-center gap-4 px-16 cursor-pointer transition-all mt-12 lg:mt-8"
            onClick={onLoginClick}
            loading={loadStatus}
          >
            <span className="text-lg font-semibold">{token ? 'Explore' : 'Enter Demo'}</span>
            <ArrowSvg className="transition-all group-hover:translate-x-2" />
          </CommonButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Login;
