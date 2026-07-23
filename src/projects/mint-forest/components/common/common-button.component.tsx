import classNames from 'classnames';
import { ButtonHTMLAttributes, FC } from 'react';
import LoadMore from './loadmore/loadmore.component';

export interface CommonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  primary?: boolean;
  loading?: boolean;
}
const CommonButton: FC<CommonButtonProps> = (props) => {
  const { children, className, disabled, onClick, loading, primary, ...restProps } = props;

  return (
    <button
      className={classNames(
        'border border-primary relative transition-all duration-300 cursor-pointer rounded-md text-base text-primary active:scale-x-[0.98] active:scale-y-[0.98] hover:brightness-125',
        {
          'bg-primary !text-black': primary,
          'bg-disabled text-text-lv2 !cursor-not-allowed': disabled,
          'opacity-60 !cursor-not-allowed': loading,
        },
        className
      )}
      onClick={(e) => {
        if (disabled || loading) return;
        onClick && onClick(e as any);
      }}
      {...restProps}
    >
      {children}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <LoadMore color="#00b33b" />
        </div>
      )}
    </button>
  );
};

export default CommonButton;
