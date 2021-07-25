import Head from 'next/head'

import Home from '../views/home'

export default () => {
  return (
    <div>
      <Head>
        <title>Next.js w/z WebGL2</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Home />
    </div>
  )
}
