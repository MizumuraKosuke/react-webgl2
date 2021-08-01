import DatGui, { DatColor, DatNumber } from 'react-dat-gui'

interface Opts {
  materialDiffuse: string
  lightDiffuse: string
  dirX: number
  dirY: number
  dirZ: number
}

interface Props {
  opts: Opts,
  setOpts: (opts: Opts) => void
}

const GUI = ({ opts, setOpts }: Props) => (
  <DatGui
    className="text-base"
    data={opts}
    onUpdate={setOpts}
  >
    <DatColor path="materialDiffuse" label="Sphere Color"/>
    <DatColor path="lightDiffuse" label="Light Diffuse Color"/>
    <DatNumber path="dirX" label="Translate X" min={-10} max={10} step={0.1} />
    <DatNumber path="dirY" label="Translate Y" min={-10} max={10} step={0.1} />
    <DatNumber path="dirZ" label="Translate Z" min={-10} max={10} step={0.1} />
  </DatGui>
)

export default GUI
