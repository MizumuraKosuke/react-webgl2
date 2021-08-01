import glslify from 'glslify'

interface Hooks {
  getShader: (
    type: 'vert' | 'frag',
    source: string,
    gl: WebGL2RenderingContext | undefined,
  ) => WebGLShader | undefined
  setProgram: (
    vtShader: string,
    fgShader: string,
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
  ) => void
  calculateNormals: (
    vs: number[], ind: number[]
  ) => number[]
  hex2normalizeRGB: (hex: string) => [ number, number, number ]
  normalizeRGB2hex: (rgb: [ number, number, number ]) => string
}

const useSetup: () => Hooks = () => {
  const getShader = (
    type: 'vert' | 'frag',
    source: string,
    gl: WebGL2RenderingContext | undefined,
  ) => {
    if (!gl) {
      return
    }
  
    const shader = gl.createShader(
      type === 'vert'
        ? gl.VERTEX_SHADER
        : gl.FRAGMENT_SHADER,
    )

    if (!shader) {
      return
    }

    gl.shaderSource(shader, glslify(source))
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  const setProgram = (
    vt: string,
    fg: string,
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
  ) => {
    const vtShader = getShader('vert', vt, gl)
    const fgShader = getShader('frag', fg, gl)

    if (!vtShader || !fgShader) {
      return
    }
  
    gl.attachShader(program, vtShader)
    gl.attachShader(program, fgShader)
    gl.linkProgram(program)

    if (
      !gl.getProgramParameter(
        program,
        gl.LINK_STATUS,
      )
    ) {
      alert('Could not initialize shaders')
    }

    gl.useProgram(program)
  }

  const calculateNormals = (vs: number[], ind: number[]) => {
    const
      x = 0,
      y = 1,
      z = 2,
      ns = []

    // For each vertex, initialize normal x, normal y, normal z
    for (let i = 0; i < vs.length; i += 3) {
      ns[i + x] = 0.0
      ns[i + y] = 0.0
      ns[i + z] = 0.0
    }

    // We work on triads of vertices to calculate
    for (let i = 0; i < ind.length; i += 3) {
      // Normals so i = i+3 (i = indices index)
      const v1 = [], v2 = [], normal = []

      // p2 - p1
      v1[x] = vs[3 * ind[i + 2] + x] - vs[3 * ind[i + 1] + x]
      v1[y] = vs[3 * ind[i + 2] + y] - vs[3 * ind[i + 1] + y]
      v1[z] = vs[3 * ind[i + 2] + z] - vs[3 * ind[i + 1] + z]

      // p0 - p1
      v2[x] = vs[3 * ind[i] + x] - vs[3 * ind[i + 1] + x]
      v2[y] = vs[3 * ind[i] + y] - vs[3 * ind[i + 1] + y]
      v2[z] = vs[3 * ind[i] + z] - vs[3 * ind[i + 1] + z]

      // Cross product by Sarrus Rule
      normal[x] = v1[y] * v2[z] - v1[z] * v2[y]
      normal[y] = v1[z] * v2[x] - v1[x] * v2[z]
      normal[z] = v1[x] * v2[y] - v1[y] * v2[x]

      // Update the normals of that triangle: sum of vectors
      for (let j = 0; j < 3; j++) {
        ns[3 * ind[i + j] + x] = ns[3 * ind[i + j] + x] + normal[x]
        ns[3 * ind[i + j] + y] = ns[3 * ind[i + j] + y] + normal[y]
        ns[3 * ind[i + j] + z] = ns[3 * ind[i + j] + z] + normal[z]
      }
    }

    // Normalize the result.
    // The increment here is because each vertex occurs.
    for (let i = 0; i < vs.length; i += 3) {
      // With an offset of 3 in the array (due to x, y, z contiguous values)
      const nn = []
      nn[x] = ns[i + x]
      nn[y] = ns[i + y]
      nn[z] = ns[i + z]

      let len = Math.sqrt((nn[x] * nn[x]) + (nn[y] * nn[y]) + (nn[z] * nn[z]))
      if (len === 0) len = 1.0

      nn[x] = nn[x] / len
      nn[y] = nn[y] / len
      nn[z] = nn[z] / len

      ns[i + x] = nn[x]
      ns[i + y] = nn[y]
      ns[i + z] = nn[z]
    }

    return ns
  }

  const hex2normalizeRGB = (hex: string) => {
    let newHex = `${hex}`
    if (newHex[0] === '#') {
      newHex = newHex.slice(1)
    }
    if (newHex.length === 3) {
      newHex = `${newHex[0]}${newHex[0]}${newHex[1]}${newHex[1]}${newHex[2]}${newHex[2]}`
    }

    const nRGB: [ number, number, number ] = [
      parseInt(newHex.slice(0, 2), 16) / 255,
      parseInt(newHex.slice(2, 4), 16) / 255,
      parseInt(newHex.slice(4, 6), 16) / 255,
    ]

    return nRGB
  }

  const normalizeRGB2hex = (rgb: [ number, number, number ]) => {
    return `#${rgb.map((value) => (`0${Math.round(value * 255).toString(16)}`).slice( -2 )).join('')}`
  }

  return {
    getShader,
    setProgram,
    calculateNormals,
    hex2normalizeRGB,
    normalizeRGB2hex,
  }
}

export default useSetup
