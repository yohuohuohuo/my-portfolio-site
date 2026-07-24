import type { ReactNode } from 'react';

interface PortfolioEyebrowProps {
  children: ReactNode;
}

export default function PortfolioEyebrow({ children }: PortfolioEyebrowProps) {
  return <p className="m-0 text-[12px] font-bold uppercase text-[#c6c1b6]">{children}</p>;
}
