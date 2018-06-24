import React, { Component } from 'react'
import Head from 'next/head'
import Main from '../components/Main'

class MyApp extends Component {
  render () {
    return (
      <div>
        <Head>
          <title>Worldwide Mining Profitability</title>
          <link rel="stylesheet" type="text/css" href="/static/normalize.css" />
          <link rel="stylesheet" type="text/css" href="/static/styles.css" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon.png" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>
        <Main />
        <div className="footer">
          <p><a href="https://github.com/enlyth/mining-profit">GitHub</a></p>
        </div>
      </div>
    )
  }
}

export default MyApp
