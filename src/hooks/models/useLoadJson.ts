import { useRef } from 'react'

import { ObjectType } from '../../interfaces/objects'

const useAxis: (
  data: {
    vertices: number[]
    indices: number[]
    diffuse?: number[]
  }
) => ObjectType = (data) => {
  const ibo = useRef<WebGLBuffer | null>(null)
  const vao = useRef<WebGLVertexArrayObject | null>(null)
  const vertices = useRef<number[]>([])
  const indices = useRef<number[]>([])

  const diffuse = useRef<number[]>([ 1, 1, 1, 1 ])
  const ambient = useRef<number[]>([ 0.2, 0.2, 0.2, 1 ])
  const specular = useRef<number[]>([ 1, 1, 1, 1 ])
  const wireframe = useRef<boolean>(false)

  const build = () => {
    vertices.current = data.vertices
    indices.current = data.indices
    if (data.diffuse) {
      diffuse.current = data.diffuse
    }
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
