const generatePosition = () => {
  return [
    Math.floor(Math.random() * 50) - Math.floor(Math.random() * 50),
    Math.floor(Math.random() * 30) + 50,
    Math.floor(Math.random() * 50),
  ]
}

const G = 9.8

class BouncingBall {
  position: number[]
  H0: number
  V0: number
  VF: number
  HF: number
  bouncingTime: number
  BOUNCINESS: number
  color: number[]

  constructor() {
    this.position = generatePosition()

    this.H0 = this.position[1]
    this.V0 = 0
    this.VF = Math.sqrt(2 * G * this.H0)
    this.HF = 0

    this.bouncingTime = 0
    this.BOUNCINESS = (Math.random() + 0.5)

    this.color = [ Math.random(), Math.random(), Math.random(), 1 ]
  }

  update(time: number): void {
    const t = time - this.bouncingTime
    const h = this.H0 + (this.V0 * t) - (0.5 * G * t * t)

    if (h <= 0) {
      this.bouncingTime = time
      this.V0 = this.VF * this.BOUNCINESS
      this.HF = (this.V0 * this.V0) / (2 * G)
      this.VF = Math.sqrt(2 * G * this.HF)
      this.H0 = 0
    }
    else {
      this.position[1] = h
    }
  }
}

export default BouncingBall
