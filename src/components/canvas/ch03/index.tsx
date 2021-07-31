import { createRef, useEffect, useRef } from 'react'
import { mat4 } from 'gl-matrix'

import useSteUp from '../../../hooks/useSetup'

import vt from './ch03.vert'
import fg from './ch03.frag'
import sphere from './sphere.json'

const { vertices, indices } = sphere

const Canvas = () => {
  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>()
  const program = useRef<WebGLProgram | null>()
  const sphereVAO = useRef<WebGLVertexArrayObject | null>()
  // matrix
  const modelViewMatrix = useRef(mat4.create())
  const projectionMatrix = useRef(mat4.create())
  const normalMatrix = useRef(mat4.create())
  // uniform
  const uProjectionMatrix = useRef<WebGLUniformLocation | null>()
  const uModelViewMatrix = useRef<WebGLUniformLocation | null>()
  const uNormalMatrix = useRef<WebGLUniformLocation | null>()

  const { setProgram, calculateNormals } = useSteUp()

  const initProgram = () => {
    if (!gl.current) {
      return
    }
    program.current = gl.current.createProgram()

    if (!program.current) {
      return
    }

    setProgram(vt, fg, gl.current, program.current)

    uProjectionMatrix.current = gl.current.getUniformLocation(program.current, 'uProjectionMatrix')
    uModelViewMatrix.current = gl.current.getUniformLocation(program.current, 'uModelViewMatrix')
    uNormalMatrix.current = gl.current.getUniformLocation(program.current, 'uNormalMatrix')
  }

  const initLights = () => {
    if (!gl.current || !program.current) {
      return
    }
    gl.current.uniform3fv(
      gl.current.getUniformLocation(program.current, 'uLightDirection'),
      [ 0, -1, -1 ],
    )
    gl.current.uniform3fv(
      gl.current.getUniformLocation(program.current, 'uLightDiffuse'),
      [ 1, 1, 1 ],
    )
    gl.current.uniform3fv(
      gl.current.getUniformLocation(program.current, 'uMaterialDiffuse'),
      [ 0.5, 0.8, 0.1 ],
    )
  }

  const initBuffers = () => {
    if (!gl.current || !program.current) {
      return
    }

    // Create VAO instance
    sphereVAO.current = gl.current.createVertexArray()
    gl.current.bindVertexArray(sphereVAO.current)

    // Vertices
    const sphereVertexBuffer = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ARRAY_BUFFER,
      sphereVertexBuffer,
    )
    gl.current.bufferData(
      gl.current.ARRAY_BUFFER,
      new Float32Array(vertices),
      gl.current.STATIC_DRAW,
    )

    const aVertexPosition = gl.current.getAttribLocation(program.current, 'aVertexPosition')
    gl.current.enableVertexAttribArray(aVertexPosition)
    gl.current.vertexAttribPointer(aVertexPosition, 3, gl.current.FLOAT, false, 0, 0)

    // Normals
    const normals = calculateNormals(vertices, indices)

    const sphereNormalsBuffer = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ARRAY_BUFFER,
      sphereNormalsBuffer,
    )
    gl.current.bufferData(
      gl.current.ARRAY_BUFFER,
      new Float32Array(normals),
      gl.current.STATIC_DRAW,
    )
    
    const aVertexNormal = gl.current.getAttribLocation(program.current, 'aVertexNormal')
    gl.current.enableVertexAttribArray(aVertexNormal)
    gl.current.vertexAttribPointer(aVertexNormal, 3, gl.current.FLOAT, false, 0, 0)

    // Indices
    const sphereIndicesBuffer = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ELEMENT_ARRAY_BUFFER,
      sphereIndicesBuffer,
    )
    gl.current.bufferData(
      gl.current.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.current.STATIC_DRAW,
    )

    // Clean
    gl.current.bindVertexArray(null)
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, null)
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, null)
  }

  const draw = () => {
    if (
      !gl.current
      || !sphereVAO.current
      || !uModelViewMatrix.current
      || !uProjectionMatrix.current
      || !uNormalMatrix.current
    ) {
      return
    }

    gl.current.clear(gl.current.COLOR_BUFFER_BIT | gl.current.DEPTH_BUFFER_BIT)
    gl.current.viewport(0, 0, gl.current.canvas.width, gl.current.canvas.height)

    mat4.identity(modelViewMatrix.current)
    mat4.translate(modelViewMatrix.current, modelViewMatrix.current, [ 0, 0, -1.5 ])
    mat4.perspective(
      projectionMatrix.current, 45, gl.current.canvas.width / gl.current.canvas.height, 0.1, 10000,
    )
    mat4.copy(normalMatrix.current, modelViewMatrix.current)
    mat4.invert(normalMatrix.current, normalMatrix.current)
    mat4.transpose(normalMatrix.current, normalMatrix.current)

    gl.current.uniformMatrix4fv(uModelViewMatrix.current, false, modelViewMatrix.current)
    gl.current.uniformMatrix4fv(uProjectionMatrix.current, false, projectionMatrix.current)
    gl.current.uniformMatrix4fv(uNormalMatrix.current, false, normalMatrix.current)

    try {
      gl.current.bindVertexArray(sphereVAO.current)

      gl.current.drawElements(
        gl.current.TRIANGLES,
        indices.length,
        gl.current.UNSIGNED_SHORT,
        0,
      )

      gl.current.bindVertexArray(null)
    }
    catch (e) {
      alert(e)
    }
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
    initLights()
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