// Modal open/close as a micro pub-sub, so 3D meshes can open HTML modals.
const listeners = new Set()
export const onModal = (fn) => (listeners.add(fn), () => listeners.delete(fn))
export const openModal = (payload) => listeners.forEach((fn) => fn(payload))
export const closeModal = () => listeners.forEach((fn) => fn(null))
