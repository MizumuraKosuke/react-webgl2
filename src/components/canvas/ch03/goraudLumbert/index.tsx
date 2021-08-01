import { createRef, useEffect, useRef, useState } from 'react'
import { mat4 } from 'gl-matrix'

import GUI from './gui'
import useSteUp from '../../../../hooks/useSetup'

import vt from './groudLumbert.vert'
import fg from './groudLumbert.frag'
import sphere from '../sphere.json'

const { vertices, indices } = sphere

interface Opts {
  materialDiffuse: string
  lightDiffuse: string
  dirX: number
  dirY: number
  dirZ: number
}

interface Uniforms {
  modelViewMatrix: mat4
  projectionMatrix: mat4
  normalMatrix: mat4
  lightDirection: [ number, number, number ]
  lightDiffuse: [ number, number, number ]
  materialDiffuse: [ number, number, number ]
}
interface UniformLocations {
  uProjectionMatrix: WebGLUniformLocation | null
  uModelViewMatrix: WebGLUniformLocation | null
  uNormalMatrix: WebGLUniformLocation | null
  uLightDirection: WebGLUniformLocation | null
  uLightDiffuse: WebGLUniformLocation | null
  uMaterialDiffuse: WebGLUniformLocation | null
}

const Canvas = () => {
  const {
    setProgram,
    calculateNormals,
    hex2normalizeRGB,
    normalizeRGB2hex,
  } = useSteUp()

  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>()
  const program = useRef<WebGLProgram | null>()
  const sphereVAO = useRef<WebGLVertexArrayObject | null>()

  // uniform
  const uniforms = useRef<Uniforms>({
    modelViewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
    normalMatrix: mat4.create(),
    lightDirection: [ 0, -1, -1 ],
    lightDiffuse: [ 1, 1, 1 ],
    materialDiffuse: [ 0.5, 0.8, 0.1 ],
  })

  const uLocations = useRef<UniformLocations>({
    uModelViewMatrix: null,
    uProjectionMatrix: null,
    uNormalMatrix: null,
    uLightDirection: null,
    uLightDiffuse: null,
    uMaterialDiffuse: null,
  })

  const [ guiData, setGuiData ] = useState({
    materialDiffuse: normalizeRGB2hex(uniforms.current.materialDiffuse),
    lightDiffuse: normalizeRGB2hex(uniforms.current.lightDiffuse),
    dirX: uniforms.current.lightDirection[0],
    dirY: uniforms.current.lightDirection[1],
    dirZ: uniforms.current.lightDirection[2],
  })

  const initProgram = () => {
    if (!gl.current) {
      return
    }
    program.current = gl.current.createProgram()

    if (!program.current) {
      return
    }

    setProgram(vt, fg, gl.current, program.current)

    uLocations.current.uProjectionMatrix = gl.current.getUniformLocation(program.current, 'uProjectionMatrix')
    uLocations.current.uModelViewMatrix = gl.current.getUniformLocation(program.current, 'uModelViewMatrix')
    uLocations.current.uNormalMatrix = gl.current.getUniformLocation(program.current, 'uNormalMatrix')
    uLocations.current.uLightDirection = gl.current.getUniformLocation(program.current, 'uLightDirection')
    uLocations.current.uLightDiffuse = gl.current.getUniformLocation(program.current, 'uLightDiffuse')
    uLocations.current.uMaterialDiffuse = gl.current.getUniformLocation(program.current, 'uMaterialDiffuse')
  }

  const initLights = () => {
    if (!gl.current || !program.current) {
      return
    }
    gl.current.uniform3fv(
      uLocations.current.uLightDirection,
      uniforms.current.lightDirection,
    )
    gl.current.uniform3fv(
      uLocations.current.uLightDiffuse,
      uniforms.current.lightDiffuse,
    )
    gl.current.uniform3fv(
      uLocations.current.uMaterialDiffuse,
      uniforms.current.materialDiffuse,
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
    ) {
      return
    }

    gl.current.clear(gl.current.COLOR_BUFFER_BIT | gl.current.DEPTH_BUFFER_BIT)
    gl.current.viewport(0, 0, gl.current.canvas.width, gl.current.canvas.height)

    mat4.identity(uniforms.current.modelViewMatrix)
    mat4.translate(
      uniforms.current.modelViewMatrix,
      uniforms.current.modelViewMatrix,
      [ 0, 0, -1.5 ],
    )
    mat4.perspective(
      uniforms.current.projectionMatrix,
      45,
      gl.current.canvas.width / gl.current.canvas.height,
      0.1,
      10000,
    )
    mat4.copy(uniforms.current.normalMatrix, uniforms.current.modelViewMatrix)
    mat4.invert(uniforms.current.normalMatrix, uniforms.current.normalMatrix)
    mat4.transpose(uniforms.current.normalMatrix, uniforms.current.normalMatrix)

    gl.current.uniformMatrix4fv(
      uLocations.current.uModelViewMatrix,
      false,
      uniforms.current.modelViewMatrix,
    )
    gl.current.uniformMatrix4fv(
      uLocations.current.uProjectionMatrix,
      false,
      uniforms.current.projectionMatrix,
    )
    gl.current.uniformMatrix4fv(
      uLocations.current.uNormalMatrix,
      false,
      uniforms.current.normalMatrix,
    )

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

  const render = () => {
    requestAnimationFrame(render)
    draw()
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

    gl.current.enable(gl.current.DEPTH_TEST)
    initProgram()
    initBuffers()
    initLights()
    render()

    window.addEventListener('resize', setCanvasSize)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }

  const onUpdateDat = (opts: Opts) => {
    if (!gl.current || !program.current) {
      return
    }

    if (
      guiData.dirX !== opts.dirX
      || guiData.dirY !== opts.dirY
      || guiData.dirZ !== opts.dirZ
    ) {
      uniforms.current.lightDirection = [ opts.dirX, opts.dirY, opts.dirZ ]
      gl.current.uniform3fv(
        uLocations.current.uLightDirection,
        uniforms.current.lightDirection,
      )
    }

    if (guiData.lightDiffuse !== opts.lightDiffuse) {
      uniforms.current.lightDiffuse = hex2normalizeRGB(opts.lightDiffuse)
      gl.current.uniform3fv(
        uLocations.current.uLightDiffuse,
        uniforms.current.lightDiffuse,
      )
    }
    if (guiData.materialDiffuse !== opts.materialDiffuse) {
      uniforms.current.materialDiffuse = hex2normalizeRGB(opts.materialDiffuse)
      gl.current.uniform3fv(
        uLocations.current.uMaterialDiffuse,
        uniforms.current.materialDiffuse,
      )
    }
    setGuiData(opts)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <>
      <div className="fixed inset-0 -z-1 bg-white pointer-events-none">
        <canvas
          ref={canvas}
          className="w-full h-full"
        />
      </div>
      <GUI setOpts={onUpdateDat} opts={guiData} />
    </>
  )
}

export default Canvas