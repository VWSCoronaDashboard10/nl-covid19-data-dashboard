import '@reach/combobox/styles.css';
import Router from 'next/router';
import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import '~/components/comboBox/comboBox.scss';
import '~/components/legenda/legenda.scss';
import * as piwik from '~/lib/piwik';
import '~/scss/style.scss';
import { GlobalStyle } from '~/style/global-style';
import theme from '~/style/theme';

// Import Preact DevTools in development
// if (process.env.NODE_ENV === 'development') {
//   // Must use require here as import statements are only allowed
//   // to exist at the top of a file.
//   require('preact/debug');
// }

interface AppProps {
  Component: any;
  pageProps: any;
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const page = (page: React.ReactNode) => page;
  const getLayout = Component.getLayout || page;

  useEffect(() => {
    window.document.documentElement.className += ' js';
    const handleRouteChange = (url: string) => {
      if (url.indexOf('?menu') !== -1) {
        /* Ope ing a menu on mobile scrolls to the top of the menus */
        window.document
          .querySelector('#main-navigation,aside')
          ?.scrollIntoView(true);
      } else {
        /* Any other page scrolls to the top */
        window.scrollTo(0, 0);
      }
      piwik.pageview();
    };

    Router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  const pageWithLayout = getLayout(<Component {...pageProps} />, pageProps);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {pageWithLayout}
    </ThemeProvider>
  );
}
