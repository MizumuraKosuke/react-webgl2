import Link from 'next/link'

const Home = () => {
  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-center text-3xl font-bold mb-6">
        O&apos;REILLY<br />初めてのWebGL 2 with Next.js
      </h1>
      <ul>
        <li className="pb-2">
          <Link href="/ch02">
            <a>
              <span>chart 2. レンダリング</span>
            </a>
          </Link>
        </li>
        <li>
          <span className="pb-2">chart 3. 光源</span>
          <ul>
            <li className="pl-2">
              <Link href="/ch03/goraudLambert">
                <a>
                  <span>ランバート反射を伴うグローシェーディング</span>
                </a>
              </Link>
            </li>
            <li className="pl-2">
              <Link href="/ch03/goraudPhong">
                <a>
                  <span>フォン反射を伴うグローシェーディング</span>
                </a>
              </Link>
            </li>
            <li className="pl-2">
              <Link href="/ch03/phongPhong">
                <a>
                  <span>フォン反射を伴うフォンシェーディング</span>
                </a>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </main>
  )
}

export default Home
