import classNames from 'classnames';
import { AnimatePresence, motion } from 'motion/react';
import { FC, useEffect, useState } from 'react';
import { useGlobalStore } from '../hooks';

export type AlertType = 'success' | 'info' | 'error';

export interface AlertProps {
  message: string;
  type: AlertType;
  duration: number;
  className?: string;
}

const AlertTemplate: FC<AlertProps> = ({ message, type, className, duration }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShow(false);
    }, duration || 3000);
  }, [duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={classNames('p-5 rounded-xs shadow-lg !-mt-12', className, {
            'bg-success': type === 'success',
            'bg-waring': type === 'info',
            'bg-error': type === 'error',
          })}
          initial={{ opacity: 0, scale: 0, translateY: '-10%' }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0, translateY: '-10%' }}
        >
          <span
            className={classNames('text-md text-white', {
              // '!text-black': type === 'success',
            })}
          >
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Alert: FC<{ className?: string }> = ({ className }) => {
  const { setState } = useGlobalStore();
  const [alertList, setAlertList] = useState<AlertProps[]>([]);

  const addAlert = (message: string, type: AlertType, duration?: number) => {
    setAlertList((current) => {
      return [...current, { message, type, duration: duration || 3000 }];
    });
  };

  useEffect(() => {
    setState({ addAlert });
  }, []);

  return (
    <div
      className={classNames(
        'absolute left-1/2 -translate-x-1/2 top-[5%] z-[999999] flex flex-col items-center',
        className
      )}
    >
      {alertList.map((item, index) => {
        return <AlertTemplate key={index} message={item.message} type={item.type} duration={item.duration} />;
      })}
    </div>
  );
};

export default Alert;
