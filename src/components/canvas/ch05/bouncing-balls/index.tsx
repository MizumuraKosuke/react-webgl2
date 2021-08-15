import { useEffect, useRef, useState } from 'react'

import GUI, { Opts } from './gui'

import useTransforms from '../../../../hooks/models/transforms'
import useCamera from '../../../../hooks/models/camera'
import useFloor from '../../../../hooks/models/floor'
import useLoadJson from '../../../../hooks/models/useLoadJson'
import BouncingBall from '../../../../models/bouncing-ball'
import Ball from './ball.json'

import vt from './bouncing-balls.vert'
import fg from './bouncing-balls.frag'

import { ObjectType } from '../../../../interfaces/objects'

interface UniformLocations {
  uModelViewMatrix: WebGLUniformLocation | null
  uProjectionMatrix: WebGLUniformLocation | null
  uNormalMatrix: WebGLUniformLocation | null
  uLightPosition: WebGLUniformLocation | null
  uLightDiffuse: WebGLUniformLocation | null
  uLightAmbient: WebGLUniformLocation | null
  uLightSpecular: WebGLUniformLocation | null
  uMaterialDiffuse: WebGLUniformLocation | null
  uMaterialAmbient: WebGLUniformLocation | null
  uMaterialSpecular: WebGLUniformLocation | null
  uShininess: WebGLUniformLocation | null
  uWireframe: WebGLUniformLocation | null
  uUpdateLight: WebGLUniformLocation | null
  uTranslation: WebGLUniformLocation | null
  uTranslate: WebGLUniformLocation | null
}

const ballsCount = 50

const Canvas = () => {
  const {
    canvas,
    gl,
    program,
    modelViewMatrix,
    projectionMatrix,
    normalMatrix,
    setCanvasSize,
    setProgram,
    setBuffers,
    bindBuffers,
    cleanBuffers,
    drawBuffers,
    updatePerspective,
  } = useTransforms()

  const camera = useCamera()
  const floor = useFloor()
  const ballObject = useLoadJson(Ball)

  const balls = useRef<BouncingBall[]>([])
  const currentTime = useRef((new Date()).getTime())
  const timer = useRef(0)

  const [ guiData, setGuiData ] = useState<Opts>({
    cameraType: 'ORBITING_TYPE',
    fixedLight: false,
  })

  // uniformのロケーション参照用
  const uLocations = useRef<UniformLocations>({
    uModelViewMatrix: null,
    uProjectionMatrix: null,
    uNormalMatrix: null,
    uLightPosition: null,
    uLightDiffuse: null,
    uLightAmbient: null,
    uLightSpecular: null,
    uMaterialDiffuse: null,
    uMaterialAmbient: null,
    uMaterialSpecular: null,
    uShininess: null,
    uWireframe: null,
    uUpdateLight: null,
    uTranslation: null,
    uTranslate: null,
  })

  const initProgram = () => {
    setProgram(vt, fg)

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
      [ 0, 120, 120 ],
    )
    gl.current.uniform4fv(
      uLocations.current.uLightAmbient,
      [ 0.2, 0.2, 0.2, 1 ],
    )
    gl.current.uniform4fv(
      uLocations.current.uLightDiffuse,
      [ 1, 1, 1, 1 ],
    )
    gl.current.uniform4fv(
      uLocations.current.uLightSpecular,
      [ 1, 1, 1, 1 ],
    )
    gl.current.uniform1f(
      uLocations.current.uShininess,
      230,
    )
    gl.current.uniform3fv(
      uLocations.current.uTranslation,
      [ 0, 0, 0 ],
    )
    gl.current.uniform1i(
      uLocations.current.uTranslate,
      0,
    )
  }

  const initStaticObjects = () => {
    floor.build({ dimension: 80, lines: 2 })
    setBuffers(floor)
    ballObject.build()
    setBuffers(ballObject)
    for (let i = 0; i < ballsCount; i++) {
      balls.current = [ ...balls.current, new BouncingBall() ]
    }
  }

  const updateObjectsUniforms = (object: ObjectType, translate: boolean) => {
    if (!gl.current || !object) {
      return
    }
    modelViewMatrix.current = camera.getViewTransform()
    gl.current.uniformMatrix4fv(
      uLocations.current.uModelViewMatrix,
      false,
      modelViewMatrix.current,
    )
    gl.current.uniformMatrix4fv(
      uLocations.current.uProjectionMatrix,
      false,
      projectionMatrix.current,
    )
    normalMatrix.current = camera.getNormalTransform()
    gl.current.uniformMatrix4fv(
      uLocations.current.uNormalMatrix,
      false,
      normalMatrix.current,
    )
    gl.current.uniform1i(uLocations.current.uTranslate, translate ? 1  : 0)
    if (object.diffuse?.current) {
      gl.current.uniform4fv(uLocations.current.uMaterialDiffuse, object.diffuse.current)
    }
    if (object.specular?.current) {
      gl.current.uniform4fv(uLocations.current.uMaterialSpecular, object.specular.current)
    }
    if (object.ambient?.current) {
      gl.current.uniform4fv(uLocations.current.uMaterialAmbient, object.ambient.current)
    }
    gl.current.uniform1i(uLocations.current.uWireframe, object.wireframe?.current ? 1 : 0)
  }

  const draw = () => {
    if (!gl.current) {
      return
    }

    gl.current.clear(gl.current.COLOR_BUFFER_BIT | gl.current.DEPTH_BUFFER_BIT)
    gl.current.viewport(0, 0, gl.current.canvas.width, gl.current.canvas.height)

    updatePerspective(camera)
    
    gl.current.uniform1i(uLocations.current.uUpdateLight, guiData.fixedLight ? 1 : 0)

    updateObjectsUniforms(floor, false)
    drawBuffers(floor)

    updateObjectsUniforms(ballObject, true)
    bindBuffers(ballObject)
    balls.current.forEach((ball) => {
      ball.update(timer.current)
      gl.current?.uniform3fv(uLocations.current.uTranslation, ball.position)
      gl.current?.uniform4fv(uLocations.current.uMaterialDiffuse, ball.color)
      gl.current?.drawElements(
        gl.current.TRIANGLES,
        ballObject.indices.current.length,
        gl.current.UNSIGNED_SHORT,
        0,
      )
    })
    cleanBuffers()
  }

  const render = () => {
    const time = (new Date()).getTime() / 1000
    timer.current += time - currentTime.current
    currentTime.current = time

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
    gl.current.depthFunc(gl.current.LEQUAL)

    initProgram()
    initLights()
    updatePerspective(camera)
    initStaticObjects()
    camera.goHome()

    currentTime.current = (new Date()).getTime() / 1000
    render()

    window.addEventListener('resize', setCanvasSize)
    return () => {
      window.removeEventListener('resize', setCanvasSize)
    }
  }

  const onUpdateGui = (opts: Opts) => {
    if (!gl.current) {
      return
    }
    if (guiData.cameraType !== opts.cameraType) {
      camera.goHome()
      camera.setType(opts.cameraType)
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
        setOpts={onUpdateGui}
        opts={guiData}
        goHome={() => camera.goHome()}
      />
    </>
  )
}

export default Canvas
