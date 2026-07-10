import Layout from '@/layout/layout';
import Alert from '@/shared/components/alert.component';
import RainbowRoot from '@/shared/hooks/use-web3.hook';
import '@/shared/styles/common.scss';
import '@/shared/styles/globals.scss';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import { ReactNode } from 'react';
import Style from 'styled-jsx/style';

const montserrat = Montserrat({ subsets: ['latin'] });
const DINCond = localFont({
  src: '../../public/fonts/DINCond-Bold.otf',
  display: 'swap',
  variable: '--font-DINCond',
});

export default function App({ Component, pageProps }: AppProps) {
  const getPage = () => {
    const defaultLayout = (children: ReactNode) => {
      return <Layout>{children}</Layout>;
    };
    const getLayout = (Component as any).getLayout || defaultLayout;
    return getLayout(<Component {...pageProps} />);
  };

  return (
    <>
      <Head>
        <meta name="keywords" content={`MINT | forest | MINT forest | Mint Blockchain`} />
        <meta name="description" property="og:description" content={``} />
        <meta
          name="viewport"
          content="width=device-width, 
               initial-scale=1.0, 
               maximum-scale=1.0, 
               minimum-scale=1.0, 
               user-scalable=no"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta content="website" property="og:type" />
        <meta content="Mint forest" property="og:site_name" />
        <meta content="Mint forest" name="apple-mobile-web-app-title" />
        <meta content="Mint forest" name="application-name" />
        <meta content="#00b33b" name="msapplication-TileColor" />
        <meta
          property="og:title"
          content={
            'In Mint Forest V3, you’ll unlock brand-new features, uncover the magical world of Mint Forest, and earn generous rewards.'
          }
        />
        <meta property="og:image" content={'https://mintforest.io/images/og-img.jpg'} />
        <meta property="version" content={'v0.0.1-prod'} />
      </Head>
      <Style global>
        {`
            :root{
              --font-montserrat: ${montserrat.style.fontFamily};
              --font-DINCond: ${DINCond.style.fontFamily};
            }
          `}
      </Style>
      <RainbowRoot>{getPage()}</RainbowRoot>
      <Alert />
    </>
  );
}
