import classNames from 'classnames';
import React, { ReactNode } from 'react';

const GoButton = ({
  onClick,
  text = 'Go',
  className,
}: {
  onClick: () => void;
  text?: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'w-fit lg:min-w-28 min-w-24 h-18 p-1 bg-white rounded-[12px] cursor-pointer hover:brightness-110',
        className
      )}
      style={{
        boxShadow: '0px 1px 2px 0px #DBAC65',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #D6FF62 8.93%, #42CA21 82.14%)',
          boxShadow: '0px 1px 1px 0px rgba(41, 141, 10, 0.37), 0px -1px 2px 0px #1B5900 inset',
        }}
        className="w-full h-full border border-[#73DA21] rounded-[10px] flex items-center justify-center cursor-pointer lg:px-11 px-3"
        onClick={onClick}
      >
        <span
          className="text-white text-[16px] font-bold drop-shadow-md pb-1"
          style={
            {
              // WebkitTextStrokeWidth: '1px',
              // WebkitTextStrokeColor: '#349F02',
            }
          }
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export default GoButton;
