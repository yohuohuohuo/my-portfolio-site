import '@/projects/mint-forest/styles/animations.css';
import '@/projects/mint-forest/styles/rc-dropdown.css';
import '@/projects/mint-forest/styles/theme.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import Style from 'styled-jsx/style';

const montserrat = Montserrat({ subsets: ['latin'] });
const DINCond = localFont({
  src: '../../public/projects/mint-forest/fonts/DINCond-Bold.otf',
  display: 'swap',
  variable: '--font-DINCond',
});

export default function App({ Component, pageProps }: AppProps) {
  const page = <Component {...pageProps} />;

  return (
    <>
      <Head>
        <title>Personal Portfolio</title>
        <meta name="description" content="A small collection of interactive work." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f6f7f9" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Style global>
        {`
          :root {
            --font-montserrat-source: ${montserrat.style.fontFamily};
            --font-DINCond-source: ${DINCond.style.fontFamily};
          }
        `}
      </Style>
      {page}
    </>
  );
}
