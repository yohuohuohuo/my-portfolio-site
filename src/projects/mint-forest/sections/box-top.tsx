import Dropdown from '@/shared/components/dropdown.component';
import { useAlert, useClientAccount } from '@/shared/hooks';
import { NotifyEvent, notifyService } from '@/shared/services/notify.service';
import { MenuCopySvg, MenuLogoutSvg, WalletSvg } from '@/shared/svg';
import { ellipsis } from '@/shared/utils';
import { FC, useRef } from 'react';
import { useClipboard } from 'use-clipboard-copy';
import { useDisconnect } from 'wagmi';
import BackGroundMusic from '../components/background-music';

interface BoxTopInterface {}

const BoxTop: FC<BoxTopInterface> = (props) => {
  const dropRef = useRef<any>(null);
  const { address } = useClientAccount();
  const alert = useAlert();
  const { copy } = useClipboard();
  const { disconnect } = useDisconnect();

  const onCopyClick = () => {
    if (!address) return;
    copy(address);
    alert.success('Address copied to clipboard!');
    dropRef.current?.hide();
  };

  const onLogoutClick = () => {
    if (!address) return;
    disconnect();
    notifyService.notify(NotifyEvent.LOGIN_REFRESH);
    alert.success('Successfully logged out.');
    dropRef.current?.hide();
  };

  return (
    <div className="absolute left-8 top-[98px] lg:left-[unset] lg:right-12 xl:left-[unset] xl:right-[15%] lg:top-0 flex items-center gap-3 lg:gap-12 pt-12 text-white">
      <BackGroundMusic />
      {address && (
        <>
          <Dropdown
            onRef={dropRef}
            trigger="hover"
            placement={['bottom']}
            content={() => (
              <>
                <div
                  className="w-[178px] h-fit rounded-3xl bg-[rgba(0,0,0,0.6)] p-4"
                  style={{
                    boxShadow:
                      '0px 2px 4px 0px rgba(255, 255, 255, 0.50) inset, 0px -4px 2px 0px rgba(0, 0, 0, 0.5) inset',
                  }}
                >
                  <div
                    className="w-full flex items-center cursor-pointer gap-6 px-4 py-5 mb-2 rounded-sm text-white hover:text-primary hover:bg-[rgba(0,0,0,0.2)]"
                    onClick={onCopyClick}
                  >
                    <MenuCopySvg />
                    <span className="text-md">Copy Address</span>
                  </div>
                  <div
                    className="w-full flex items-center cursor-pointer gap-6 px-4 py-5 mb-2 rounded-sm text-white hover:text-primary hover:bg-[rgba(0,0,0,0.2)]"
                    onClick={onLogoutClick}
                  >
                    <MenuLogoutSvg />
                    <span className="text-md">Log Out</span>
                  </div>
                </div>
              </>
            )}
          >
            <div className="flex items-center h-15 px-5 gap-4 lg:gap-7 lg:px-12 lg:h-24 rounded-3xl bg-[rgba(0,0,0,0.5)] cursor-pointer">
              <WalletSvg className={'w-10 h-8 lg:w-15 lg:h-12'} />
              <span className="text-lg">{ellipsis(address, 4, 4)}</span>
            </div>
          </Dropdown>
        </>
      )}
    </div>
  );
};

export default BoxTop;
