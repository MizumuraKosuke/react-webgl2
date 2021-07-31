import { createRef, useEffect, useRef } from 'react'

import useSteUp from '../../../hooks/useSetup'

import vt from './ch03.vert'
import fg from './ch03.frag'

const Canvas = () => {
  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>()
  const program = useRef<WebGLProgram | null>()
  const indices = useRef<number[]>([])
  const squareVAO = useRef<WebGLVertexArrayObject | null>()

  const { setProgram } = useSteUp()

  const initProgram = () => {
    if (!gl.current) {
      return
    }
    program.current = gl.current.createProgram()

    if (!program.current) {
      return
    }

    setProgram(vt, fg, gl.current, program.current)
  }

  const initBuffers = () => {
    if (!gl.current || !program.current) {
      return
    }
    const vertices = [
      -0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0,
    ]

    indices.current = [ 0, 1, 2, 0, 2, 3 ]

    // Create VAO instance
    squareVAO.current = gl.current.createVertexArray()
    gl.current.bindVertexArray(squareVAO.current)

    // Setting up the VBO
    const squareVertexBuffer = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ARRAY_BUFFER,
      squareVertexBuffer,
    )
    gl.current.bufferData(
      gl.current.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.current.STATIC_DRAW,
    )

    const aVertexPosition = gl.current.getAttribLocation(program.current, 'aVertexPosition')
    gl.current.enableVertexAttribArray(aVertexPosition)
    gl.current.vertexAttribPointer(aVertexPosition, 3, gl.current.FLOAT, false, 0, 0)

    // Setting up the IBO
    const squareIndexBuffer = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ELEMENT_ARRAY_BUFFER,
      squareIndexBuffer,
    )
    gl.current.bufferData(
      gl.current.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices.current),
      gl.current.STATIC_DRAW,
    )

    // Clean
    gl.current.bindVertexArray(null)
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, null)
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, null)
  }

  const draw = () => {
    if (!gl.current || !squareVAO.current) {
      return
    }

    gl.current.clear(gl.current.COLOR_BUFFER_BIT | gl.current.DEPTH_BUFFER_BIT)
    gl.current.viewport(0, 0, gl.current.canvas.width, gl.current.canvas.height)

    gl.current.bindVertexArray(squareVAO.current)

    gl.current.drawElements(
      gl.current.TRIANGLES,
      indices.current.length,
      gl.current.UNSIGNED_SHORT,
      0,
    )

    gl.current.bindVertexArray(null)
  }

  const setCanvasSize = () => {
    if (!gl.current || !canvas.current) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    canvas.current.width = window.innerWidth * dpr
    canvas.current.height = window.innerHeight * dpr
  }

  const init = () => {
    if (!canvas.current) {
      alert('Sorry! No HTML5 Canvas was found on this page')
      return
    }

    gl.current = canvas.current?.getContext('webgl2')

    if (!gl.current) {
      alert('Sorry! WebGL is not available')
      return
    }

    setCanvasSize()

    initProgram()
    initBuffers()
    draw()

    window.addEventListener('resize', setCanvasSize)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="fixed inset-0 -z-1 bg-black pointer-events-none">
      <canvas
        ref={canvas}
        className="w-full h-full"
      />
    </div>
  )
}

export default Canvas