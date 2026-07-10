import Dropdown from '@/shared/components/dropdown.component';
import { useAlert } from '@/shared/hooks';
import { MenuCopySvg, MenuLogoutSvg } from '@/shared/svg';
import { FC, useRef } from 'react';
import { useClipboard } from 'use-clipboard-copy';
import BackGroundMusic from '../components/background-music';
import { useMintForestStore } from '../store/use-mint-forest-store';

interface BoxTopInterface {}

const BoxTop: FC<BoxTopInterface> = () => {
  const dropRef = useRef<{ hide?: () => void }>(null);
  const alert = useAlert();
  const { copy } = useClipboard();
  const { userInfo, logout, reset } = useMintForestStore();

  const onCopyClick = () => {
    if (!userInfo) return;
    copy(String(userInfo.greenId));
    alert.success('Demo ID copied to clipboard.');
    dropRef.current?.hide?.();
  };

  const onResetClick = () => {
    reset();
    alert.success('Demo data has been reset.');
    dropRef.current?.hide?.();
  };

  const onLogoutClick = async () => {
    await logout();
    alert.success('Successfully logged out.');
    dropRef.current?.hide?.();
  };

  if (!userInfo) return null;

  return (
    <div className="absolute left-8 top-[98px] lg:left-[unset] lg:right-12 xl:left-[unset] xl:right-[15%] lg:top-0 flex items-center gap-3 lg:gap-12 pt-12 text-white">
      <BackGroundMusic />
      <Dropdown
        onRef={dropRef}
        trigger="hover"
        placement={['bottom']}
        content={() => (
          <div
            className="w-[210px] h-fit rounded-3xl bg-[rgba(0,0,0,0.6)] p-4"
            style={{ boxShadow: '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px rgba(0, 0, 0, 0.5) inset' }}
          >
            <div className="w-full flex items-center cursor-pointer gap-6 px-4 py-5 mb-2 rounded-sm text-white hover:text-primary hover:bg-[rgba(0,0,0,0.2)]" onClick={onCopyClick}>
              <MenuCopySvg />
              <span className="text-md">Copy Demo ID</span>
            </div>
            <div className="w-full flex items-center cursor-pointer gap-6 px-4 py-5 mb-2 rounded-sm text-white hover:text-primary hover:bg-[rgba(0,0,0,0.2)]" onClick={onResetClick}>
              <MenuCopySvg />
              <span className="text-md">Reset Demo Data</span>
            </div>
            <div className="w-full flex items-center cursor-pointer gap-6 px-4 py-5 rounded-sm text-white hover:text-primary hover:bg-[rgba(0,0,0,0.2)]" onClick={onLogoutClick}>
              <MenuLogoutSvg />
              <span className="text-md">Log Out</span>
            </div>
          </div>
        )}
      >
        <div className="flex items-center h-15 px-5 gap-4 lg:gap-7 lg:px-12 lg:h-24 rounded-3xl bg-[rgba(0,0,0,0.5)] cursor-pointer">
          <span className="text-lg">Demo ID {userInfo.greenId}</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default BoxTop;
