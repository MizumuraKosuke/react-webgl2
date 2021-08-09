import { MutableRefObject } from 'react'

export interface ObjectType {
  ibo: MutableRefObject<WebGLBuffer | null>
  vao: MutableRefObject<WebGLVertexArrayObject | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (data?: any) => void
  vertices: MutableRefObject<number[]>
  indices: MutableRefObject<number[]>
  wireframe?: MutableRefObject<boolean>
  diffuse?: MutableRefObject<number[]>
  ambient?: MutableRefObject<number[]>
  specular?: MutableRefObject<number[]>
  scalars?: MutableRefObject<number[]>
}
