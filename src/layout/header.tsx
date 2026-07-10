import { useAlert, useGlobalStore } from '@/shared/hooks';
import classNames from 'classnames';
import { FC } from 'react';

interface HeaderInterface {
  className?: string;
}

const Header: FC<HeaderInterface> = ({ className }) => {
  const alert = useAlert();

  return (
    <>
      <header
        className={classNames(
          'w-full h-36 px-4 lg:px-20 flex items-center justify-between border-b border-line absolute top-0 left-0 z-50 flex-shrink-0 bg-background-lv1',
          className
        )}
        onClick={() => {
          const random = Math.random();
          if (random < 0.3) {
            alert.error('erore msg ahahahah' + random, 5000);
          } else if (random >= 0.3 && random < 0.6) {
            alert.warning('warning msg ahahahah ajsdh' + random, 3000);
          } else {
            alert.success('success msg ahahahah akjshdkj has ' + random, 2000);
          }
        }}
      >
        header
      </header>
    </>
  );
};

export default Header;
