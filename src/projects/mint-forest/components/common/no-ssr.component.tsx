import { FC, PropsWithChildren, useEffect, useState } from 'react';

/**
 * https://nextjs.org/docs/messages/react-hydration-error
 * @param props
 * @returns
 */
const NoSSR: FC<PropsWithChildren> = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (props.children as any) : <></>;
};

export default NoSSR;
