import MintForestProject from '@/projects/mint-forest';
import Head from 'next/head';

export default function MintForestPage() {
  return (
    <>
      <Head>
        <title>Mint Forest Demo</title>
        <meta name="description" content="A local interactive Mint Forest demo." />
        <meta property="og:title" content="Mint Forest Demo" />
        <meta property="og:image" content="/projects/mint-forest/images/og-img.jpg" />
      </Head>
      <MintForestProject />
    </>
  );
}
