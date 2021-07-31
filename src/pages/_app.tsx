import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'

import '../styles/globals.scss'
import '../../node_modules/react-dat-gui/dist/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  )
}
export default MyApp
