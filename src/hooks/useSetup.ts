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

  return {
    getShader,
    setProgram,
  }
}

export default useSetup
