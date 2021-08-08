import DatGui, { DatNumber, DatSelect, DatFolder, DatButton } from 'react-dat-gui'

export interface Opts {
  cameraType: 'TRACKING_TYPE' | 'ORBITING_TYPE'
  dolly: number
  posX: number
  posY: number
  posZ: number
  elevation: number
  azimuth: number
}

interface Props {
  opts: Opts,
  setOpts: (opts: Opts) => void
  goHome: () => void
}

const GUI = ({ opts, setOpts, goHome }: Props) => (
  <DatGui
    className="text-base"
    data={opts}
    onUpdate={setOpts}
  >
    <DatSelect path="cameraType" label="Camera Type" options={[ 'TRACKING_TYPE', 'ORBITING_TYPE' ]} />
    <DatNumber path="dolly" label="Dolly" min={-100} max={100} step={0.1} />
    <DatFolder title="Position" closed={false}>
      <DatNumber path="posX" label="Position X" min={-100} max={100} step={0.1} />
      <DatNumber path="posY" label="Position Y" min={-100} max={100} step={0.1} />
      <DatNumber path="posZ" label="Position Z" min={-100} max={100} step={0.1} />
    </DatFolder>
    <DatFolder title="Rotation" closed={false}>
      <DatNumber path="elevation" label="Elevation" min={-180} max={180} step={0.1} />
      <DatNumber path="azimuth" label="Azimuth" min={-180} max={180} step={0.1} />
    </DatFolder>
    <DatButton label="goHome" onClick={goHome} />
  </DatGui>
)

export default GUI
