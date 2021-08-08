import { useRef } from 'react'

import { ObjectType } from '../../interfaces/objects'

const useFloor: () => ObjectType = () => {
  const ibo = useRef<WebGLBuffer | null>(null)
  const vao = useRef<WebGLVertexArrayObject | null>(null)

  const vertices = useRef<number[]>([])
  const indices = useRef<number[]>([])

  const diffuse = useRef<number[]>([ 1, 1, 1, 1 ])
  const ambient = useRef<number[]>([ 0.2, 0.2, 0.2, 1 ])
  const specular = useRef<number[]>([ 1, 1, 1, 1 ])
  const wireframe = useRef<boolean>(true)

  const build = (
    { dimension, lines: initlines }: { dimension: number, lines: number },
  ) => {
    const lines = 2 * dimension / initlines

    const inc = 2 * dimension / lines
    const v = []
    const i = []

    for (let l = 0; l <= lines; l++) {
      v[6 * l] = -dimension
      v[6 * l + 1] = 0
      v[6 * l + 2] = -dimension + (l * inc)

      v[6 * l + 3] = dimension
      v[6 * l + 4] = 0
      v[6 * l + 5] = -dimension + (l * inc)

      v[6 * (lines + 1) + 6 * l] = -dimension + (l * inc)
      v[6 * (lines + 1) + 6 * l + 1] = 0
      v[6 * (lines + 1) + 6 * l + 2] = -dimension

      v[6 * (lines + 1) + 6 * l + 3] = -dimension + (l * inc)
      v[6 * (lines + 1) + 6 * l + 4] = 0
      v[6 * (lines + 1) + 6 * l + 5] = dimension

      i[2 * l] = 2 * l
      i[2 * l + 1] = 2 * l + 1
      i[2 * (lines + 1) + 2 * l] = 2 * (lines + 1) + 2 * l
      i[2 * (lines + 1) + 2 * l + 1] = 2 * (lines + 1) + 2 * l + 1
    }

    vertices.current = v
    indices.current = i
  }

  return {
    ibo,
    vao,
    build,
    vertices,
    indices,
    wireframe,
    diffuse,
    ambient,
    specular,
  }
}

export default useFloor