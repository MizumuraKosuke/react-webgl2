import DatGui, { DatColor, DatNumber } from 'react-dat-gui'

interface Opts {
  lightDiffuse: string
  lightAmbient: number
  lightSpecular: number
  dirX: number
  dirY: number
  dirZ: number
  materialDiffuse: string
  materialAmbient: number
  materialSpecular: number
  shininess: number
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
    <DatColor path="lightDiffuse" label="Light Diffuse Color"/>
    <DatNumber path="lightAmbient" label="Light Ambient Term" min={0} max={1} step={0.01}/>
    <DatNumber path="lightSpecular" label="Light Specular Term" min={0} max={1} step={0.01}/>
    <DatNumber path="dirX" label="Translate X" min={-10} max={10} step={0.1} />
    <DatNumber path="dirY" label="Translate Y" min={-10} max={10} step={0.1} />
    <DatNumber path="dirZ" label="Translate Z" min={-10} max={10} step={0.1} />
    <DatColor path="materialDiffuse" label="Sphere Color"/>
    <DatNumber path="materialAmbient" label="Material Ambient Term" min={0} max={1} step={0.01}/>
    <DatNumber path="materialSpecular" label="Material Specular Term" min={0} max={1} step={0.01}/>
    <DatNumber path="shininess" label="Shininess" min={0} max={100} step={1}/>
  </DatGui>
)

export default GUI
