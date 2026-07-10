import { FC, HTMLAttributes, RefAttributes } from 'react';

const LinearSpan: FC<HTMLAttributes<HTMLSpanElement> & RefAttributes<HTMLSpanElement>> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <span
      style={{
        ...style,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
      {...rest}
    >
      {children}
    </span>
  );
};

export default LinearSpan;
