import { createRef, useEffect, useRef, useState } from 'react'
import { mat4 } from 'gl-matrix'

import GUI from './gui'
import useSteUp from '../../../../hooks/useSetup'

import goraudVt from './goraudPhong.vert'
import goraudFg from './goraudPhong.frag'
import phongVt from './phongPhong.vert'
import phongFg from './phongPhong.frag'
import sphere from '../sphere.json'

const { vertices, indices } = sphere

interface Opts {
  lightDiffuse: string
  lightAmbient: number
  lightSpecular: number
  dirX: number
  dirY: number
  dirZ: number
  materialDiffuse: string
  materialAmbient: number
  materialSpecular: number
  shininess: number
}

interface Uniforms {
  modelViewMatrix: mat4
  projectionMatrix: mat4
  normalMatrix: mat4
  lightDirection: [ number, number, number ]
  lightAmbient: [ number, number, number, number ]
  lightDiffuse: [ number, number, number, number ]
  lightSpecular: [ number, number, number, number ]
  materialAmbient: [ number, number, number, number ]
  materialDiffuse: [ number, number, number, number ]
  materialSpecular: [ number, number, number, number ]
  shininess: number
}
interface UniformLocations {
  uProjectionMatrix: WebGLUniformLocation | null
  uModelViewMatrix: WebGLUniformLocation | null
  uNormalMatrix: WebGLUniformLocation | null
  uLightDirection: WebGLUniformLocation | null
  uLightAmbient: WebGLUniformLocation | null
  uLightDiffuse: WebGLUniformLocation | null
  uLightSpecular: WebGLUniformLocation | null
  uMaterialAmbient: WebGLUniformLocation | null
  uMaterialDiffuse: WebGLUniformLocation | null
  uMaterialSpecular: WebGLUniformLocation | null
  uShininess: WebGLUniformLocation | null
}

interface Props {
  shading: 'phong' | 'goraud'
}

// sync with essl layout
const aVertexPosition = 0
const aVertexNormal = 1

const Canvas = ({ shading }: Props) => {
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
  const lastTime = useRef<number | null>(null)
  const angle = useRef(0)

  // uniform
  const uniforms = useRef<Uniforms>({
    modelViewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
    normalMatrix: mat4.create(),
    lightDirection: [ -0.25, -0.25, -0.25 ],
    lightAmbient: [ 0.03, 0.03, 0.03, 1 ],
    lightDiffuse: [ 46 / 256, 99 / 256, 191 / 256, 1 ],
    materialAmbient: [ 1, 1, 1, 1 ],
    materialDiffuse: [ 1, 1, 1, 1 ],
    materialSpecular: [ 1, 1, 1, 1 ],
    shininess: 10,
    lightSpecular: [ 1, 1, 1, 1 ],
  })

  const uLocations = useRef<UniformLocations>({
    uModelViewMatrix: null,
    uProjectionMatrix: null,
    uNormalMatrix: null,
    uLightDirection: null,
    uLightAmbient: null,
    uLightDiffuse: null,
    uMaterialAmbient: null,
    uMaterialDiffuse: null,
    uMaterialSpecular: null,
    uShininess: null,
    uLightSpecular: null,
  })

  const [ guiData, setGuiData ] = useState<Opts>({
    lightDiffuse: normalizeRGB2hex([
      uniforms.current.lightDiffuse[0],
      uniforms.current.lightDiffuse[1],
      uniforms.current.lightDiffuse[2],
    ]),
    lightAmbient: uniforms.current.lightAmbient[0],
    lightSpecular: uniforms.current.lightSpecular[0],
    dirX: uniforms.current.lightDirection[0],
    dirY: uniforms.current.lightDirection[1],
    dirZ: uniforms.current.lightDirection[2],
    materialDiffuse: normalizeRGB2hex([
      uniforms.current.materialDiffuse[0],
      uniforms.current.materialDiffuse[1],
      uniforms.current.materialDiffuse[2],
    ]),
    materialAmbient: uniforms.current.materialAmbient[0],
    materialSpecular: uniforms.current.materialSpecular[0],
    shininess: uniforms.current.shininess,
  })

  const initProgram = () => {
    if (!gl.current) {
      return
    }
    program.current = gl.current.createProgram()

    if (!program.current) {
      return
    }

    shading === 'goraud'
      ? setProgram(goraudVt, goraudFg, gl.current, program.current)
      : setProgram(phongVt, phongFg, gl.current, program.current)

    uLocations.current.uProjectionMatrix = gl.current.getUniformLocation(program.current, 'uProjectionMatrix')
    uLocations.current.uModelViewMatrix = gl.current.getUniformLocation(program.current, 'uModelViewMatrix')
    uLocations.current.uNormalMatrix = gl.current.getUniformLocation(program.current, 'uNormalMatrix')
    uLocations.current.uLightDirection = gl.current.getUniformLocation(program.current, 'uLightDirection')
    uLocations.current.uLightAmbient = gl.current.getUniformLocation(program.current, 'uLightAmbient')
    uLocations.current.uLightDiffuse = gl.current.getUniformLocation(program.current, 'uLightDiffuse')
    uLocations.current.uLightSpecular = gl.current.getUniformLocation(program.current, 'uLightSpecular')
    uLocations.current.uMaterialAmbient = gl.current.getUniformLocation(program.current, 'uMaterialAmbient')
    uLocations.current.uMaterialDiffuse = gl.current.getUniformLocation(program.current, 'uMaterialDiffuse')
    uLocations.current.uMaterialSpecular = gl.current.getUniformLocation(program.current, 'uMaterialSpecular')
    uLocations.current.uShininess = gl.current.getUniformLocation(program.current, 'uShininess')
  }

  const initLights = () => {
    if (!gl.current || !program.current) {
      return
    }
    gl.current.uniform3fv(
      uLocations.current.uLightDirection,
      uniforms.current.lightDirection,
    )
    gl.current.uniform4fv(
      uLocations.current.uLightAmbient,
      uniforms.current.lightAmbient,
    )
    gl.current.uniform4fv(
      uLocations.current.uLightDiffuse,
      uniforms.current.lightDiffuse,
    )
    gl.current.uniform4fv(
      uLocations.current.uMaterialAmbient,
      uniforms.current.materialAmbient,
    )
    gl.current.uniform4fv(
      uLocations.current.uMaterialDiffuse,
      uniforms.current.materialDiffuse,
    )
    gl.current.uniform4fv(
      uLocations.current.uMaterialSpecular,
      uniforms.current.materialSpecular,
    )
    gl.current.uniform1f(
      uLocations.current.uShininess,
      uniforms.current.shininess,
    )
    gl.current.uniform4fv(
      uLocations.current.uLightSpecular,
      uniforms.current.lightSpecular,
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
    mat4.rotate(
      uniforms.current.modelViewMatrix, 
      uniforms.current.modelViewMatrix,
      angle.current * Math.PI / 180, [ 0, 1, 0 ],
    )
    mat4.perspective(
      uniforms.current.projectionMatrix,
      45,
      gl.current.canvas.width / gl.current.canvas.height,
      0.1,
      10000,
    )
    mat4.copy(
      uniforms.current.normalMatrix,
      uniforms.current.modelViewMatrix,
    )
    mat4.invert(
      uniforms.current.normalMatrix,
      uniforms.current.normalMatrix,
    )
    mat4.transpose(
      uniforms.current.normalMatrix,
      uniforms.current.normalMatrix,
    )

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
    const timeNow = new Date().getTime()
    if (lastTime.current) {
      const elapsed = timeNow - lastTime.current
      angle.current += (90 * elapsed) / 1000.0
    }
    lastTime.current = timeNow
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
      uniforms.current.lightDiffuse = [ ...hex2normalizeRGB(opts.lightDiffuse), 1 ]
      gl.current.uniform4fv(
        uLocations.current.uLightDiffuse,
        uniforms.current.lightDiffuse,
      )
    }
    if (guiData.lightAmbient !== opts.lightAmbient) {
      uniforms.current.lightAmbient = [
        opts.lightAmbient, opts.lightAmbient, opts.lightAmbient, opts.lightAmbient,
      ]
      gl.current.uniform4fv(
        uLocations.current.uLightAmbient,
        uniforms.current.lightAmbient,
      )
    }
    if (guiData.lightSpecular !== opts.lightSpecular) {
      uniforms.current.lightSpecular = [
        opts.lightSpecular, opts.lightSpecular, opts.lightSpecular, opts.lightSpecular,
      ]
      gl.current.uniform4fv(
        uLocations.current.uLightSpecular,
        uniforms.current.lightSpecular,
      )
    }
    if (guiData.materialDiffuse !== opts.materialDiffuse) {
      uniforms.current.materialDiffuse = [ ...hex2normalizeRGB(opts.materialDiffuse), 1 ]
      gl.current.uniform4fv(
        uLocations.current.uMaterialDiffuse,
        uniforms.current.materialDiffuse,
      )
    }
    if (guiData.materialAmbient !== opts.materialAmbient) {
      uniforms.current.materialAmbient = [
        opts.materialAmbient, opts.materialAmbient, opts.materialAmbient, opts.materialAmbient,
      ]
      gl.current.uniform4fv(
        uLocations.current.uMaterialAmbient,
        uniforms.current.materialAmbient,
      )
    }
    if (guiData.materialSpecular !== opts.materialSpecular) {
      uniforms.current.materialSpecular = [
        opts.materialSpecular, opts.materialSpecular, opts.materialSpecular, opts.materialSpecular,
      ]
      gl.current.uniform4fv(
        uLocations.current.uMaterialSpecular,
        uniforms.current.materialSpecular,
      )
    }
    if (guiData.shininess !== opts.shininess) {
      uniforms.current.shininess = opts.shininess
      gl.current.uniform1f(
        uLocations.current.uShininess,
        uniforms.current.shininess,
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