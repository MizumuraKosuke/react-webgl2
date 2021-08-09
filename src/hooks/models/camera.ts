import { useRef, MutableRefObject } from 'react'
import { mat4, vec3, vec4 } from 'gl-matrix'

interface Hooks {
  type: MutableRefObject<'ORBITING_TYPE' | 'TRACKING_TYPE'>
  position: MutableRefObject<vec3>
  focus: MutableRefObject<vec3>
  up: MutableRefObject<vec3>
  right: MutableRefObject<vec3>
  normal: MutableRefObject<vec3>
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
  const position = useRef(home)
  const focus = useRef(vec3.create())

  const up = useRef(vec3.create())
  const right = useRef(vec3.create())
  const normal = useRef(vec3.create())

  const matrix = useRef(mat4.create())

  const steps = useRef(0)
  const azimuth = useRef(0)
  const elevation = useRef(0)
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

    const newRight = vec4.create()
    vec4.set(newRight, 1, 0, 0, 0)
    vec4.transformMat4(newRight, newRight, matrix.current)
    vec3.copy(right.current, newRight as vec3)

    const newUp = vec4.create()
    vec4.set(newUp, 0, 1, 0, 0)
    vec4.transformMat4(newUp, newUp, matrix.current)
    vec3.copy(up.current, newUp as vec3)

    const newNormal = vec4.create()
    vec4.set(newNormal, 0, 0, 1, 0)
    vec4.transformMat4(newNormal, newNormal, matrix.current)
    vec3.copy(normal.current, newNormal as vec3)
  }

  const setType = (newType: 'ORBITING_TYPE' | 'TRACKING_TYPE') => {
    type.current = newType
  }

  const setPosition = (newPosition: vec3) => {
    vec3.copy(position.current, newPosition)
    update()
  }

  const setAzimuth = (newAzimuth: number) => {
    azimuth.current += newAzimuth - azimuth.current
    if (azimuth.current > 360 || azimuth.current < -360) {
      azimuth.current = azimuth.current % 360
    }
    update()
  }

  const setElevation = (newElevation: number) => {
    elevation.current += newElevation - elevation.current
    if (elevation.current > 360 || elevation.current < -360) {
      elevation.current = elevation.current % 360
    }
    update()
  }

  const dolly = (stepIncrement: number) => {
    const newNormal = vec3.create()
    const newPosition = vec3.create()
    vec3.normalize(newNormal, normal.current)

    const newStep = stepIncrement - steps.current

    if (type.current === 'TRACKING_TYPE') {
      newPosition[0] = position.current[0] - newStep * newNormal[0]
      newPosition[1] = position.current[1] - newStep * newNormal[1]
      newPosition[2] = position.current[2] - newStep * newNormal[2]
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
    focus,
    up,
    right,
    normal,
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