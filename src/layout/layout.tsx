import { useClientAccount } from '@/shared/hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, ReactNode } from 'react';
import Footer from './footer';
import Header from './header';

interface LayoutInterface {
  children: ReactNode;
}

const Layout: FC<LayoutInterface> = ({ children }) => {
  const router = useRouter();
  const { address } = useClientAccount();

  const {
    query: { inviteCode },
    replace,
    pathname,
  } = useRouter();

  return (
    <>
      <Head>
        <title>Mint Forest</title>
      </Head>
      <div
        id="app-root"
        className="w-full h-[100dvh] flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar lg:scroll-bar justify-between"
      >
        {/* <Header /> */}
        <main className="w-full bg-background-lv1">{children}</main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Layout;
