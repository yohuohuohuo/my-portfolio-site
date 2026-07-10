/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { staticUrl } from '@/shared/utils';
import { ForwardRefRenderFunction, ImgHTMLAttributes, forwardRef, useMemo } from 'react';

interface CommonImgInterface extends ImgHTMLAttributes<HTMLImageElement> {
  local?: boolean;
}

const CommonImgComponent: ForwardRefRenderFunction<HTMLImageElement, CommonImgInterface> = (
  { src, local, ...rest },
  ref
) => {
  const currenUrl = useMemo(() => {
    if (!src) {
      return '/images/pic-default.svg';
    }

    if ((src && src.startsWith('http')) || local) {
      return src;
    }
    return staticUrl(src);
  }, [local, src]);

  return <img src={currenUrl} {...rest} />;
};

const CommonImg = forwardRef(CommonImgComponent);
export default CommonImg;
