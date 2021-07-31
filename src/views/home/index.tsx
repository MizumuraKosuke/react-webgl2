import Canvas from '../../components/canvas/ch02_01_square'

import styles from './home.module.scss'

const Home = () => {
  return (
    <>
      <Canvas />
      <main className={styles.container}>
        <h1 className="text-white">Home</h1>
      </main>
    </>
  )
}

export default Home
