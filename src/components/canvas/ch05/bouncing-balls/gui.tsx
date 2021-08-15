import DatGui, { DatSelect, DatBoolean, DatButton } from 'react-dat-gui'

export interface Opts {
  cameraType: 'TRACKING_TYPE' | 'ORBITING_TYPE'
  fixedLight: boolean
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
    <DatBoolean path="fixedLight" label="Static Light Position" />
    <DatButton label="goHome" onClick={goHome} />
  </DatGui>
)

export default GUI
