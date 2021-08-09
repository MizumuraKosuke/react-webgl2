import glslify from 'glslify'

import calculateNormals from '../utils/caluculateNormals'

import { ObjectType } from '../interfaces/objects'

interface Hooks {
  setCanvasSize: (canvas: HTMLCanvasElement | null) => void
  setProgram: (
    vtShader: string,
    fgShader: string,
    gl: WebGL2RenderingContext | null,
    program: WebGLProgram | null,
  ) => void
  setBuffers: (
    gl: WebGL2RenderingContext | null,
    object: ObjectType,
    attributes: {
      aVertexPosition: number,
      aVertexNormal: number,
      aVertexColor?: number
    },
  ) => void
  drawBuffers: (
    gl: WebGL2RenderingContext | null,
    object: ObjectType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uniforms: any,
  ) => void
}

const useSetup: () => Hooks = () => {
  const setCanvasSize = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
      return
    }
    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
  }

  const getShader = (
    type: 'vert' | 'frag',
    source: string,
    gl: WebGL2RenderingContext | undefined,
  ) => {
    if (!gl) {
      return
    }
  
    const shader = gl.createShader(
      type === 'vert'
        ? gl.VERTEX_SHADER
        : gl.FRAGMENT_SHADER,
    )

    if (!shader) {
      return
    }

    gl.shaderSource(shader, glslify(source))
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  const setProgram = (
    vt: string,
    fg: string,
    gl: WebGL2RenderingContext | null,
    program: WebGLProgram | null,
  ) => {
    if (!gl || !program) {
      return
    }

    const vtShader = getShader('vert', vt, gl)
    const fgShader = getShader('frag', fg, gl)

    if (!vtShader || !fgShader) {
      return
    }
  
    gl.attachShader(program, vtShader)
    gl.attachShader(program, fgShader)
    gl.linkProgram(program)

    if (
      !gl.getProgramParameter(
        program,
        gl.LINK_STATUS,
      )
    ) {
      alert('Could not initialize shaders')
    }

    gl.useProgram(program)
  }

  const setBuffers = (
    gl: WebGL2RenderingContext | null,
    object: ObjectType,
    attributes: {
      aVertexPosition: number,
      aVertexNormal: number,
      aVertexColor?: number,
    },
  ) => {
    if (!gl) {
      return
    }

    const {
      aVertexPosition,
      aVertexNormal,
      aVertexColor,
    } = attributes

    // Create VAO instance
    object.vao.current = gl.createVertexArray()
    gl.bindVertexArray(object.vao.current)

    // Vertices
    const sphereVertexBuffer = gl.createBuffer()
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      sphereVertexBuffer,
    )
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(object.vertices.current),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(aVertexPosition)
    gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0)

    // Normals
    const normals = calculateNormals(object.vertices.current, object.indices.current)
    const sphereNormalsBuffer = gl.createBuffer()
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      sphereNormalsBuffer,
    )
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(normals),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(aVertexNormal)
    gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0, 0)

    // Color
    if (object.scalars?.current && aVertexColor) {
      const sphereColorBuffer = gl.createBuffer()
      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        sphereColorBuffer,
      )
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(object.scalars.current),
        gl.STATIC_DRAW,
      )
      gl.enableVertexAttribArray(aVertexColor)
      gl.vertexAttribPointer(aVertexColor, 4, gl.FLOAT, false, 0, 0)
    }

    // Indices
    object.ibo.current = gl.createBuffer()
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      object.ibo.current,
    )
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(object.indices.current),
      gl.STATIC_DRAW,
    )

    // Clean
    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  const drawBuffers = (
    gl: WebGL2RenderingContext | null,
    object: ObjectType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uniforms: any,
  ) => {
    if (!gl) {
      return
    }

    const {
      uMaterialDiffuse,
      uWireframe,
    } = uniforms

    if (uMaterialDiffuse && object.diffuse?.current) {
      gl.uniform4fv(uMaterialDiffuse, object.diffuse.current)
    }
    if (uWireframe) {
      gl.uniform1i(uWireframe, object.wireframe?.current ? 1: 0)
    }

    // Bind
    gl.bindVertexArray(object.vao.current)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo.current)

    // Draw
    if (object.wireframe?.current) {
      gl.drawElements(gl.LINES, object.indices.current.length, gl.UNSIGNED_SHORT, 0)
    }
    else {
      gl.drawElements(gl.TRIANGLES, object.indices.current.length, gl.UNSIGNED_SHORT, 0)
    }

    // Clean
    gl.bindVertexArray(null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  return {
    setCanvasSize,
    setProgram,
    setBuffers,
    drawBuffers,
  }
}

export default useSetup
