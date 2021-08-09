import { useRef, MutableRefObject } from 'react'
import { mat4, vec3, vec4 } from 'gl-matrix'

interface Hooks {
  type: MutableRefObject<'ORBITING_TYPE' | 'TRACKING_TYPE'>
  position: MutableRefObject<vec3>
  upAxis: MutableRefObject<vec3>
  rightAxis: MutableRefObject<vec3>
  cameraAxis: MutableRefObject<vec3>
  matrix: MutableRefObject<mat4>
  steps: MutableRefObject<number>
  azimuth: MutableRefObject<number>
  elevation: MutableRefObject<number>
  fov: MutableRefObject<number>
  minZ: MutableRefObject<number>
  maxZ: MutableRefObject<number>
  setType: (type: 'ORBITING_TYPE' | 'TRACKING_TYPE') => void
  setPosition: (position: vec3) => void
  setAzimuth: (azimuth: number) => void
  setElevation: (elevation: number) => void
  dolly: (stepIncrement: number) => void
  goHome: (newHome?: vec3) => void
  getViewTransform: () => mat4,
  getNormalTransform: () => mat4,
}

const home = [ 0, 7, 36 ] as vec3
const useCamera: () => Hooks = () => {
  const type = useRef<'ORBITING_TYPE' | 'TRACKING_TYPE'>('ORBITING_TYPE')
  
  const upAxis = useRef(vec3.create())
  const rightAxis = useRef(vec3.create())
  const cameraAxis = useRef(vec3.create())
  const position = useRef(home)

  const matrix = useRef(mat4.create())

  const steps = useRef(0)
  const azimuth = useRef(0)
  const elevation = useRef(0)

  // perspective camera option
  const fov = useRef(45)
  const minZ = useRef(0.1)
  const maxZ = useRef(10000)

  const update = () => {
    mat4.identity(matrix.current)

    if (type.current === 'TRACKING_TYPE') {
      mat4.translate(matrix.current, matrix.current, position.current)
      mat4.rotateY(matrix.current, matrix.current, azimuth.current * Math.PI / 180)
      mat4.rotateX(matrix.current, matrix.current, elevation.current * Math.PI / 180)

      const pos = vec4.create()
      vec4.set(pos, 0, 0, 0, 1)
      vec4.transformMat4(pos, pos, matrix.current)
      vec3.copy(position.current, pos as vec3)
    }
    else {
      mat4.rotateY(matrix.current, matrix.current, azimuth.current * Math.PI / 180)
      mat4.rotateX(matrix.current, matrix.current, elevation.current * Math.PI / 180)
      mat4.translate(matrix.current, matrix.current, position.current)
    }

    const newRightAxis = vec4.create()
    vec4.set(newRightAxis, 1, 0, 0, 0)
    vec4.transformMat4(newRightAxis, newRightAxis, matrix.current)
    vec3.copy(rightAxis.current, newRightAxis as vec3)

    const newUpAxis = vec4.create()
    vec4.set(newUpAxis, 0, 1, 0, 0)
    vec4.transformMat4(newUpAxis, newUpAxis, matrix.current)
    vec3.copy(upAxis.current, newUpAxis as vec3)

    const newCameraAxis = vec4.create()
    vec4.set(newCameraAxis, 0, 0, 1, 0)
    vec4.transformMat4(newCameraAxis, newCameraAxis, matrix.current)
    vec3.copy(cameraAxis.current, newCameraAxis as vec3)
  }

  const setType = (newType: 'ORBITING_TYPE' | 'TRACKING_TYPE') => {
    type.current = newType
  }

  const setPosition = (newPosition: vec3) => {
    vec3.copy(position.current, newPosition)
    update()
  }

  const setAzimuth = (newAzimuth: number) => {
    azimuth.current = newAzimuth % 360
    update()
  }

  const setElevation = (newElevation: number) => {
    elevation.current = newElevation % 360
    update()
  }

  const dolly = (stepIncrement: number) => {
    const newCameraAxis = vec3.create()
    const newPosition = vec3.create()
    vec3.normalize(newCameraAxis, cameraAxis.current)

    const newStep = stepIncrement - steps.current

    if (type.current === 'TRACKING_TYPE') {
      newPosition[0] = position.current[0] - newStep * newCameraAxis[0]
      newPosition[1] = position.current[1] - newStep * newCameraAxis[1]
      newPosition[2] = position.current[2] - newStep * newCameraAxis[2]
    }
    else {
      newPosition[0] = position.current[0]
      newPosition[1] = position.current[1]
      newPosition[2] = position.current[2] - newStep
    }

    steps.current = stepIncrement
    setPosition(newPosition)
  }

  const goHome = (newHome?: vec3) => {
    setPosition(newHome || home)
    setAzimuth(0)
    setElevation(0)
  }

  // モデルビュー行列の逆行列 = カメラ行列
  const getViewTransform = () => {
    const mat = mat4.create()
    mat4.invert(mat, matrix.current)
    return mat
  }

  // 法線行列 = モデルビュー行列の逆行列(=カメラ行列)の転置
  const getNormalTransform = () => {
    const mat = mat4.create()
    mat4.transpose(mat, matrix.current)
    return mat
  }

  return {
    type,
    position,
    upAxis,
    rightAxis,
    cameraAxis,
    matrix,
    steps,
    azimuth,
    elevation,
    fov,
    minZ,
    maxZ,
    dolly,
    goHome,
    setType,
    setPosition,
    setAzimuth,
    setElevation,
    getViewTransform,
    getNormalTransform,
  }
}

export default useCamera