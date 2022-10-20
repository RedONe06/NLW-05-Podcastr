import '../styles/global.scss';

import styles from '../styles/app.module.scss'

import { Player } from '../components/Player';
import { Header } from '../components/Header';

function MyApp({ Component, pageProps }) {
  return (
    <div className={styles.wrapperContainer}>
      <main>
        <Header />
        <Component {...pageProps} />
      </main>
      <Player />
    </div>
  )
}

export default MyApp;