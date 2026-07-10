import classNames from 'classnames';
import { motion } from 'motion/react';
import { FC, useState } from 'react';
import BuildingModal from './building-modal.component';

interface BuildingInterface {
  currentArea: any;
  opend?: boolean;
  lv: number;
}

const Building: FC<BuildingInterface> = ({ currentArea, opend, lv }) => {
  const [showTip, setShowTip] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  const onHoverStart = () => {
    if (!opend) return;

    // console.log(`on ${lv} hover`);
    setShowTip(true);
  };

  const onHoverEnd = () => {
    if (!opend) return;

    // console.log(`on ${lv} hover`);
    setShowTip(false);
  };

  const onTipClick = () => {
    if (!opend) return;

    // console.log(`on ${lv} click`);
    setShowTipModal(true);
  };

  const onTipModalClose = () => {
    setShowTipModal(false);
  };

  return (
    <>
      {currentArea && currentArea.building && (
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="absolute z-[1000] bg-[rgba(0,0,0,0)]"
          style={{
            width: currentArea.building.width,
            height: currentArea.building.height,
            left: currentArea.building.left,
            top: currentArea.building.top,
          }}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        >
          <motion.div
            onHoverEnd={onHoverEnd}
            className="absolute left-1/2 -translate-x-1/2 -top-[40px] origin-bottom"
            animate={
              showTip ? { scale: 3.2, opacity: 1, translateX: '-50%' } : { scale: 0, opacity: 0, translateX: '-50%' }
            }
            onClick={onTipClick}
          >
            <svg
              className={'w-full h-full'}
              width="100"
              height="80"
              viewBox="0 0 100 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter={`url(#building-tip-filter-${lv})`}>
                <path
                  d="M90.7152 1.32708L9.02561 4.20482C4.59815 4.36079 1.14049 8.08519 1.31335 12.512L3.20939 61.0669C3.37314 65.2603 6.74939 68.6144 10.9438 68.7505L41.875 69.7544L46.9375 79L54 70.3772L84.7446 70.8811C88.861 70.9486 92.3565 67.8809 92.8239 63.7905L98.9451 10.2305C99.5005 5.37081 95.6035 1.15488 90.7152 1.32708Z"
                  fill={currentArea.building.bg}
                />
              </g>
              <path
                d="M90.7152 1.32708L9.02561 4.20482C4.59815 4.36079 1.14049 8.08519 1.31335 12.512L3.20939 61.0669C3.37314 65.2603 6.74939 68.6144 10.9438 68.7505L41.875 69.7544L46.9375 79L54 70.3772L84.7446 70.8811C88.861 70.9486 92.3565 67.8809 92.8239 63.7905L98.9451 10.2305C99.5005 5.37081 95.6035 1.15488 90.7152 1.32708Z"
                stroke={`url(#building-tip-bg-${lv})`}
              />
              <defs>
                <filter
                  id={`building-tip-filter-${lv}`}
                  x="0.807129"
                  y="-2.17773"
                  width="98.6909"
                  height="84.0674"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="2" />
                  <feGaussianBlur stdDeviation="2" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.892084 0 0 0 0 0.823993 0 0 0 1 0" />
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_919_2706" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="-3" />
                  <feGaussianBlur stdDeviation="2" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                  <feBlend mode="normal" in2="effect1_innerShadow_919_2706" result="effect2_innerShadow_919_2706" />
                </filter>
                <linearGradient
                  id={`building-tip-bg-${lv}`}
                  x1="50.5"
                  y1="1"
                  x2="50.5"
                  y2="79"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor={currentArea.building.borderStart} />
                  <stop offset="1" stopColor={currentArea.building.borderEnd} />
                </linearGradient>
              </defs>
            </svg>

            <div className="w-42 h-36 absolute left-1/2 -translate-x-1/2 top-0 flex items-center justify-center">
              <span
                className={classNames('select-none w-44 text-sm leading-[18px] text-center font-black', {
                  'scale-90': currentArea.building.name.text.length > 16,
                  'scale-75': currentArea.building.name.text.length > 20,
                })}
                style={{
                  color: currentArea.building.name.color,
                }}
              >
                {currentArea.building.name.text}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
      {currentArea && (
        <BuildingModal buildingConfig={currentArea.building} show={showTipModal} onClose={onTipModalClose} />
      )}
    </>
  );
};

export default Building;
