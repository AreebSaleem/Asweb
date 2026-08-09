import Experience from './scene/Experience'
import { Hud, Loader, Modal, Scroller } from './ui/Overlay'

export default function App() {
  return (
    <div className="app">
      <div><Experience /></div>
      <Scroller />
      <div className="vignette" />
      <div className="grain" />
      <Hud />
      <Modal />
      <Loader />
    </div>
  )
}
