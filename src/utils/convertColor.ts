export const hex2normalizeRGB: (hex: string) => [
  number, number, number
] = (hex: string) => {
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

export const normalizeRGB2hex: (
  rgb: [ number, number, number ]
) => string = (rgb: [ number, number, number ]) => {
  return `#${rgb.map((value) => (`0${Math.round(value * 255).toString(16)}`).slice( -2 )).join('')}`
}
