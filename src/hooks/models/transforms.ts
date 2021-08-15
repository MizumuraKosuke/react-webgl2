import { useRef, createRef } from 'react'
import { mat4 } from 'gl-matrix'
import glslify from 'glslify'

import { Camera } from './camera'

import calculateNormals from '../../utils/caluculateNormals'
import { ObjectType } from '../../interfaces/objects'

// sync with essl layout
const aVertexPosition = 0
const aVertexNormal = 1
const aVertexColor = 2

const useTransforms = () => {
  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>(null)
  const program = useRef<WebGLProgram | null>(null)

  const stack = useRef(mat4.create())
  const modelViewMatrix = useRef(mat4.create())
  const projectionMatrix = useRef(mat4.create())
  const normalMatrix = useRef(mat4.create())

  const setCanvasSize = () => {
    if (!canvas.current) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    canvas.current.width = window.innerWidth * dpr
    canvas.current.height = window.innerHeight * dpr
  }

  const getShader = (
    type: 'vert' | 'frag',
    source: string,
  ) => {
    if (!gl.current) {
      return
    }
  
    const shader = gl.current.createShader(
      type === 'vert'
        ? gl.current.VERTEX_SHADER
        : gl.current.FRAGMENT_SHADER,
    )

    if (!shader) {
      return
    }

    gl.current.shaderSource(shader, glslify(source))
    gl.current.compileShader(shader)

    if (!gl.current.getShaderParameter(shader, gl.current.COMPILE_STATUS)) {
      alert(gl.current.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  const setProgram = (
    vt: string,
    fg: string,
  ) => {
    if (!gl.current) {
      return
    }

    program.current = gl.current.createProgram()
    const vtShader = getShader('vert', vt)
    const fgShader = getShader('frag', fg)

    if (!vtShader || !fgShader || !program.current) {
      return
    }
  
    gl.current.attachShader(program.current, vtShader)
    gl.current.attachShader(program.current, fgShader)
    gl.current.linkProgram(program.current)

    if (
      !gl.current.getProgramParameter(
        program.current,
        gl.current.LINK_STATUS,
      )
    ) {
      alert('Could not initialize shaders')
    }

    gl.current.useProgram(program.current)
  }

  const setBuffers = (
    object: ObjectType,
  ) => {
    if (!gl.current) {
      return
    }

    // Create VAO instance
    object.vao.current = gl.current.createVertexArray()
    gl.current.bindVertexArray(object.vao.current)

    // Vertices
    const sphereVertexBuffer = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ARRAY_BUFFER,
      sphereVertexBuffer,
    )
    gl.current.bufferData(
      gl.current.ARRAY_BUFFER,
      new Float32Array(object.vertices.current),
      gl.current.STATIC_DRAW,
    )
    gl.current.enableVertexAttribArray(aVertexPosition)
    gl.current.vertexAttribPointer(aVertexPosition, 3, gl.current.FLOAT, false, 0, 0)

    // Normals
    const normals = calculateNormals(object.vertices.current, object.indices.current)
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
    gl.current.enableVertexAttribArray(aVertexNormal)
    gl.current.vertexAttribPointer(aVertexNormal, 3, gl.current.FLOAT, false, 0, 0)

    // Color
    if (object.scalars?.current && aVertexColor) {
      const sphereColorBuffer = gl.current.createBuffer()
      gl.current.bindBuffer(
        gl.current.ARRAY_BUFFER,
        sphereColorBuffer,
      )
      gl.current.bufferData(
        gl.current.ARRAY_BUFFER,
        new Float32Array(object.scalars.current),
        gl.current.STATIC_DRAW,
      )
      gl.current.enableVertexAttribArray(aVertexColor)
      gl.current.vertexAttribPointer(aVertexColor, 4, gl.current.FLOAT, false, 0, 0)
    }

    // Indices
    object.ibo.current = gl.current.createBuffer()
    gl.current.bindBuffer(
      gl.current.ELEMENT_ARRAY_BUFFER,
      object.ibo.current,
    )
    gl.current.bufferData(
      gl.current.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(object.indices.current),
      gl.current.STATIC_DRAW,
    )

    // Clean
    gl.current.bindVertexArray(null)
    gl.current.bindBuffer(gl.current.ARRAY_BUFFER, null)
    gl.current.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, null)
  }

  const updatePerspective = (camera: Camera) => {
    if (!gl.current) {
      return
    }
    mat4.perspective(
      projectionMatrix.current,
      camera.fov.current,
      gl.current.canvas.width / gl.current.canvas.height,
      camera.minZ.current,
      camera.maxZ.current,
    )
  }

  const bindBuffers = (object: ObjectType) => {
    gl.current?.bindVertexArray(object.vao.current)
    gl.current?.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, object.ibo.current)
  }

  const cleanBuffers = () => {
    gl.current?.bindVertexArray(null)
    gl.current?.bindBuffer(gl.current.ARRAY_BUFFER, null)
    gl.current?.bindBuffer(gl.current.ELEMENT_ARRAY_BUFFER, null)
  }

  const drawBuffers = (
    object: ObjectType,
  ) => {
    if (!gl.current) {
      return
    }

    bindBuffers(object)

    // Draw
    if (object.wireframe?.current) {
      gl.current.drawElements(
        gl.current.LINES,
        object.indices.current.length,
        gl.current.UNSIGNED_SHORT,
        0,
      )
    }
    else {
      gl.current.drawElements(
        gl.current.TRIANGLES,
        object.indices.current.length,
        gl.current.UNSIGNED_SHORT,
        0,
      )
    }

    cleanBuffers()
  }

  const push = () => {
    const matrix = mat4.create()
    mat4.copy(matrix, modelViewMatrix.current)
    stack.current = matrix
  }

  const pop = () => {
    modelViewMatrix.current = stack.current
  }

  return {
    canvas,
    gl,
    program,
    modelViewMatrix,
    projectionMatrix,
    normalMatrix,
    updatePerspective,
    setCanvasSize,
    setProgram,
    setBuffers,
    bindBuffers,
    cleanBuffers,
    drawBuffers,
    push,
    pop,
  }
}

export default useTransforms
