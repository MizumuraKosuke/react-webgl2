import Canvas from '../../components/canvas/ch03/phong'

const PhongPhong = () => {
  return (
    <>
      <Canvas shading="phong" />
      <main className="flex flex-col items-center justify-center w-screen h-screen">
        <h1 className="text-white">フォン反射を伴うフォンシェーディング</h1>
      </main>
    </>
  )
}

export default PhongPhong
