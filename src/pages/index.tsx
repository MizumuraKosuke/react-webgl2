import Link from 'next/link'

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-center text-3xl font-bold mb-6">
        O&apos;REILLY<br />初めてのWebGL 2 with Next.js
      </h1>
      <ul>
        <li className="mb-2">
          <Link href="/ch02">
            <a>
              <span>chart 2. レンダリング</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/ch03">
            <a>
              <span>chart 3. 光源</span>
            </a>
          </Link>
        </li>
      </ul>
    </main>
  )
}

export default Home
