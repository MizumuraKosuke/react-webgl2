import { createRef, useEffect, useRef } from 'react'

import useSteUp from '../../../hooks/useSetup'

import vt from './ch02_01_square.vert'
import fg from './ch02_01_square.frag'

const Canvas = () => {
  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>()
  const program = useRef<WebGLProgram | null>()
  const squareVertexBuffer = useRef<WebGLBuffer | null>()
  const squareIndexBuffer = useRef<WebGLBuffer | null>()
  const indices = useRef<number[]>([])
  const aVertexPosition = useRef<number>(0)

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

    aVertexPosition.current = gl.current.getAttribLocation(program.current, 'aVertexPosition')
  }

  const initBuffers = () => {
    if (!gl.current) {
      return
    }
    /*
      V0                    V3
      (-0.5, 0.5, 0)        (0.5, 0.5, 0)
      X---------------------X
      |                     |
      |                     |
      |       (0, 0)        |
      |                     |
      |                     |
      X---------------------X
      V1                    V2
      (-0.5, -0.5, 0)       (0.5, -0.5, 0)
    */
    const vertices = [
      -0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0,
    ]

    indices.current = [ 0, 1, 2, 0, 2, 3 ]

    // Setting up the VBO
    squareVertexBuffer.current = gl.current.createBuffer()
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, squareVertexBuffer.current)
    gl.current.bufferData(
      gl.current.ARRAY_BUFFER,
      new Float32Array(vertices), gl.current.STATIC_DRAW,
    )

    // Setting up the IBO
    squareIndexBuffer.current = gl.current.createBuffer()
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, squareIndexBuffer.current)
    gl.current.bufferData(
      gl.current.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices.current), gl.current.STATIC_DRAW,
    )

    // Clean
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, null)
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, null)
  }

  const draw = () => {
    if (
      !gl.current
      || !squareVertexBuffer.current
      || !squareIndexBuffer.current
      || !program.current
    ) {
      return
    }

    // Clear the scene
    gl.current.clear(gl.current.COLOR_BUFFER_BIT | gl.current.DEPTH_BUFFER_BIT)
    gl.current.viewport(0, 0, gl.current.canvas.width, gl.current.canvas.height)

    // Use the buffers we've constructed
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, squareVertexBuffer.current)

    gl.current.vertexAttribPointer(aVertexPosition.current, 3, gl.current.FLOAT, false, 0, 0)
    gl.current.enableVertexAttribArray(aVertexPosition.current)

    // Bind IBO
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, squareIndexBuffer.current)

    // Draw to the scene using triangle primitives
    gl.current.drawElements(
      gl.current.TRIANGLES,
      indices.current.length,
      gl.current.UNSIGNED_SHORT,
      0,
    )

    // Clean
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, null)
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, null)
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

    initProgram()
    initBuffers()
    draw()
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