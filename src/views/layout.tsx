import { ReactNode } from 'react'

import Canvas from '../components/canvas'

interface Props {
  children: ReactNode
}

const Layout = ({ children }: Props) => (
  <div className="relative">
    <Canvas />
    {children}
  </div>
)

export default Layout