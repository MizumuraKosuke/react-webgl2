import Canvas from '../../components/canvas/ch03/phong'

const GoraudPhong = () => {
  return (
    <>
      <Canvas shading="goraud" />
      <main className="flex flex-col items-center justify-center w-screen h-screen">
        <h1 className="text-white">フォン反射を伴うグローシェーディング</h1>
      </main>
    </>
  )
}

export default GoraudPhong
