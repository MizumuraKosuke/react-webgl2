import { createRef, useEffect, useRef, useState } from 'react'
import { mat4 } from 'gl-matrix'

import GUI, { Opts } from './gui'
import useSteUp from '../../../../hooks/useSetup'

import Cone from '../cone3.json'

import useCamera from '../../../../hooks/models/camera'
import useFloor from '../../../../hooks/models/floor'
import useAxis from '../../../../hooks/models/axis'
import useLoadJson from '../../../../hooks/models/useLoadJson'

import vt from './camera.vert'
import fg from './camera.frag'

interface Uniforms {
  modelViewMatrix: mat4
  projectionMatrix: mat4
  normalMatrix: mat4
  materialDiffuse: [ number, number, number, number ]
  lightAmbient: [ number, number, number, number ]
  lightDiffuse: [ number, number, number, number ]
  lightPosition: [ number, number, number ]
  wireframe: boolean
}
interface UniformLocations {
  uProjectionMatrix: WebGLUniformLocation | null
  uModelViewMatrix: WebGLUniformLocation | null
  uNormalMatrix: WebGLUniformLocation | null
  uMaterialDiffuse: WebGLUniformLocation | null
  uLightAmbient: WebGLUniformLocation | null
  uLightDiffuse: WebGLUniformLocation | null
  uLightPosition: WebGLUniformLocation | null
  uWireframe: WebGLUniformLocation | null
}

// sync with essl layout
const aLocations = {
  aVertexPosition: 0,
  aVertexNormal: 1,
  aVertexColor: 2,
}

const Canvas = () => {
  const {
    setCanvasSize,
    setProgram,
    setBuffers,
    drawBuffers,
  } = useSteUp()
  const camera = useCamera()
  const floor = useFloor()
  const axis = useAxis()
  const cone = useLoadJson()

  const canvas = createRef<HTMLCanvasElement>()
  const gl = useRef<WebGL2RenderingContext | null>(null)
  const program = useRef<WebGLProgram | null>(null)

  // uniform
  const uniforms = useRef<Uniforms>({
    modelViewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
    normalMatrix: mat4.create(),
    materialDiffuse: [ 1, 1, 1, 1 ],
    lightAmbient: [ 0.20, 0.20, 0.20, 1 ],
    lightDiffuse: [ 1, 1, 1, 1 ],
    lightPosition: [ 0, 120, 120 ],
    wireframe: false,
  })

  const uLocations = useRef<UniformLocations>({
    uModelViewMatrix: null,
    uProjectionMatrix: null,
    uNormalMatrix: null,
    uMaterialDiffuse: null,
    uLightAmbient: null,
    uLightDiffuse: null,
    uLightPosition: null,
    uWireframe: null,
  })

  const [ guiData, setGuiData ] = useState<Opts>({
    cameraType: 'ORBITING_TYPE',
    dolly: 0,
    posX: camera.position.current[0],
    posY: camera.position.current[1],
    posZ: camera.position.current[2],
    elevation: camera.elevation.current,
    azimuth: camera.azimuth.current,
  })

  const initProgram = () => {
    if (!gl.current) {
      return
    }
    program.current = gl.current.createProgram()
    setProgram(vt, fg, gl.current, program.current)

    const keys = Object.keys(uLocations.current) as (keyof UniformLocations)[]
    keys.forEach((uni) => {
      if (!gl.current || !program.current) {
        return
      }
      uLocations.current[uni] = gl.current.getUniformLocation(program.current, uni)
    })
  }

  const initLights = () => {
    if (!gl.current) {
      return
    }
    gl.current.uniform3fv(
      uLocations.current.uLightPosition,
      uniforms.current.lightPosition,
    )
    gl.current.uniform4fv(
      uLocations.current.uLightAmbient,
      uniforms.current.lightAmbient,
    )
    gl.current.uniform4fv(
      uLocations.current.uLightDiffuse,
      uniforms.current.lightDiffuse,
    )
  }

  const updateTransforms = () => {
    if (!gl.current) {
      return
    }
    mat4.perspective(
      uniforms.current.projectionMatrix,
      camera.fov.current,
      gl.current.canvas.width / gl.current.canvas.height,
      camera.minZ.current,
      camera.maxZ.current,
    )
  }

  const initCamera = () => {
    camera.goHome()
    uniforms.current.modelViewMatrix = camera.getViewTransform()
    mat4.identity(uniforms.current.projectionMatrix)
    updateTransforms()
    mat4.identity(uniforms.current.normalMatrix)
    mat4.copy(uniforms.current.normalMatrix, uniforms.current.modelViewMatrix)
    mat4.invert(uniforms.current.normalMatrix, uniforms.current.normalMatrix)
    mat4.transpose(uniforms.current.normalMatrix, uniforms.current.normalMatrix)
  }

  const initStaticObjects = async () => {
    floor.build({ dimension: 80, lines: 2 })
    setBuffers(gl.current, floor, aLocations)

    axis.build({ dimension: 82 })
    setBuffers(gl.current, axis, aLocations)

    cone.build(Cone)
    setBuffers(gl.current, cone, aLocations)
  }

  const setMatrixUniforms = () => {
    if (!gl.current) {
      return
    }

    gl.current.uniformMatrix4fv(
      uLocations.current.uModelViewMatrix,
      false,
      camera.getViewTransform(),
    )
    gl.current.uniformMatrix4fv(
      uLocations.current.uProjectionMatrix,
      false,
      uniforms.current.projectionMatrix,
    )
    mat4.transpose(uniforms.current.normalMatrix, camera.matrix.current)
    gl.current.uniformMatrix4fv(
      uLocations.current.uNormalMatrix,
      false,
      uniforms.current.normalMatrix,
    )
  }

  const draw = () => {
    if (!gl.current) {
      return
    }

    gl.current.clear(gl.current.COLOR_BUFFER_BIT | gl.current.DEPTH_BUFFER_BIT)
    gl.current.viewport(0, 0, gl.current.canvas.width, gl.current.canvas.height)

    updateTransforms()
    setMatrixUniforms()

    drawBuffers(gl.current, floor, uLocations.current)
    drawBuffers(gl.current, axis, uLocations.current)
    drawBuffers(gl.current, cone, uLocations.current)
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

    setCanvasSize(canvas.current)

    gl.current.enable(gl.current.DEPTH_TEST)
    gl.current.depthFunc(gl.current.LEQUAL)

    initProgram()
    initLights()
    initCamera()
    initStaticObjects()
    render()

    const onResize = () => setCanvasSize(canvas.current)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }

  const onUpdateDat = (opts: Opts) => {
    if (!gl.current) {
      return
    }

    if (guiData.cameraType !== opts.cameraType) {
      camera.goHome()
      camera.setType(opts.cameraType)
    }
    if (guiData.dolly !== opts.dolly) {
      camera.dolly(opts.dolly)
    }
    if (
      guiData.posX !== opts.posX
      || guiData.posY !== opts.posY
      || guiData.posZ !== opts.posZ
    ) {
      camera.setPosition([ opts.posX, opts.posY, opts.posZ ])
    }
    if (guiData.elevation !== opts.elevation) {
      camera.setElevation(opts.elevation)
    }
    if (guiData.azimuth !== opts.azimuth) {
      camera.setAzimuth(opts.azimuth)
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
      <GUI
        setOpts={onUpdateDat}
        opts={guiData}
        goHome={() => camera.goHome()}
      />
    </>
  )
}

export default Canvas