import * as React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import { CacheProvider } from '@emotion/react'
import { AuthProvider } from '@/services/auth'
import createEmotionCache from '../src/mui/createEmotionCache'
import theme from '../src/mui/theme'
import Page from '@/common/layout/page'
import CssBaseline from '@mui/material/CssBaseline'
import { REGION_NAME } from '@/utils/constants'

// Redux
import { Provider } from 'react-redux'
import { store } from '@/store/store'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Agro-Climatic Advisory Portal - {REGION_NAME} (ACAP-{REGION_NAME.toUpperCase()})</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Provider store={store}>
          <AuthProvider>
            <Page customLayout={Component.customLayout !== undefined} adminPage={Component.adminPage !== undefined}>
              <Component {...pageProps} />
            </Page>
          </AuthProvider>
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
}