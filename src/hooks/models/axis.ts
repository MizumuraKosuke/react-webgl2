import { useRef } from 'react'

import { ObjectType } from '../../interfaces/objects'

const useAxis: () => ObjectType = () => {
  const ibo = useRef<WebGLBuffer | null>(null)
  const vao = useRef<WebGLVertexArrayObject | null>(null)
  const vertices = useRef<number[]>([])
  const indices = useRef<number[]>([ 0, 1, 2, 3, 4, 5 ])

  const diffuse = useRef<number[]>([ 1, 1, 1, 1 ])
  const ambient = useRef<number[]>([ 0.2, 0.2, 0.2, 1 ])
  const specular = useRef<number[]>([ 1, 1, 1, 1 ])
  const wireframe = useRef<boolean>(true)

  const build = ({ dimension }: { dimension: number }) => {
    vertices.current = [
      -dimension, 0.0, 0.0,
      dimension, 0.0, 0.0,
      0.0, -dimension / 2, 0.0,
      0.0, dimension / 2, 0.0,
      0.0, 0.0, -dimension,
      0.0, 0.0, dimension,
    ]
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

export default useAxis
