// Tiny shared state — no state library needed.
// scroll.current is eased toward scroll.target inside the frame loop.
import { SECTIONS } from './data'

export const scroll = {
  target: 0,   // 0..1, set by input handlers
  current: 0,  // 0..1, damped, read by the camera rig each frame
  moved: false,
}

const listeners = new Set()
export const onSection = (fn) => (listeners.add(fn), () => listeners.delete(fn))

let activeSection = 0
export const getActiveSection = () => activeSection
export const setSectionFromProgress = (p) => {
  const next = Math.min(SECTIONS.length - 1, Math.round(p * (SECTIONS.length - 1)))
  if (next !== activeSection) {
    activeSection = next
    listeners.forEach((fn) => fn(next))
  }
}

// progress listeners (progress bar keeps in sync with the damped value)
const progressListeners = new Set()
export const onProgress = (fn) => (progressListeners.add(fn), () => progressListeners.delete(fn))
export const emitProgress = (p) => progressListeners.forEach((fn) => fn(p))

// loader state
export const loader = { ready: false }
