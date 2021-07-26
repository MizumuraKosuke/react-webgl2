import { createRef, useEffect, useRef } from 'react'

const Canvas = () => {
  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>()

  const updateClearColor = (...color: [ number, number, number, number ]) => {
    gl.current?.clearColor(...color)
    gl.current?.clear(gl.current.COLOR_BUFFER_BIT)
    gl.current?.viewport(0, 0, 0, 0)
  }

  const init = () => {
    if (!canvas.current) {
      return
    }

    gl.current = canvas.current?.getContext('webgl2')

    updateClearColor(0.5, 0.8, 1.0, 1.0)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <canvas
        ref={canvas}
        className="w-full h-full"
      />
    </div>
  )
}

export default Canvas