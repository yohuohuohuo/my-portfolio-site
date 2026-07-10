import { FC } from 'react';

interface FooterInterface {}

const Footer: FC<FooterInterface> = (props) => {
  return <div className="flex items-center justify-between h-36 bg-white px-4 lg:px-20">Footer</div>;
};

export default Footer;
