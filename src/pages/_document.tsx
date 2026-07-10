import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          strategy="lazyOnload"
          src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
        />
        <Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=G-Q6SRB0V7X1`} />
        <Script strategy="afterInteractive" id="ga">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q6SRB0V7X1', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <Script strategy="afterInteractive" id="reCaptcha">
          {`
            if(typeof window.grecaptcha === 'undefined') {
              grecaptcha = {};
            }
            window.grecaptcha.ready = function(cb){
              if(typeof window.grecaptcha === 'undefined') {
                // window.__grecaptcha_cfg is a global variable that stores reCAPTCHA's
                // configuration. By default, any functions listed in its 'fns' property
                // are automatically executed when reCAPTCHA loads.
                const c = '___grecaptcha_cfg';
                window[c] = window[c] || {};
                (window[c]['fns'] = window[c]['fns']||[]).push(cb);
              } else {
                cb();
              }
            }
          `}
        </Script>
      </body>
    </Html>
  );
}
