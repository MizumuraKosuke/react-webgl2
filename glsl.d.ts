declare module 'glslify' {
  const func: (src: string) => string
  export default func
}
declare module '*.glsl' {
  const src: string
  export default src
}
declare module '*.vert' {
  const src: string
  export default src
}
declare module '*.frag' {
  const src: string
  export default src
}