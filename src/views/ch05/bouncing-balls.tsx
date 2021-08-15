import Canvas from '../../components/canvas/ch05/bouncing-balls'

const BouncingBallsView = () => {
  return (
    <>
      <Canvas />
      <main className="flex flex-col items-center justify-center w-screen h-screen">
        <h1 className="text-white">バウンドするボール</h1>
      </main>
    </>
  )
}

export default BouncingBallsView
