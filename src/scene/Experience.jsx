import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { STATIONS, PAGES } from '../data'
import { scroll, setSectionFromProgress, emitProgress, loader } from '../store'
import Worlds from './Worlds'

const BG = '#121010'

export const curve = new THREE.CatmullRomCurve3(
  STATIONS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)

function CameraRig() {
  const { camera, pointer } = useThree()
  const pos = useMemo(() => new THREE.Vector3(), [])
  const ahead = useMemo(() => new THREE.Vector3(), [])
  const t0 = useMemo(() => new THREE.Vector3(), [])
  const t1 = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    // frame-rate independent exponential damping — the "fly" feel
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 3.2)
    scroll.current += (scroll.target - scroll.current) * k
    const t = THREE.MathUtils.clamp(scroll.current, 0, 1)

    curve.getPointAt(t, pos)
    curve.getPointAt(Math.min(t + 0.012, 1), ahead)

    // idle breathing + pointer parallax
    const time = state.clock.elapsedTime
    pos.x += Math.sin(time * 0.5) * 0.06
    pos.y += Math.cos(time * 0.4) * 0.06
    camera.position.copy(pos)
    ahead.x += pointer.x * 0.8
    ahead.y += pointer.y * 0.5
    camera.lookAt(ahead)

    // banking: roll into turns proportional to lateral curvature
    curve.getTangentAt(Math.max(t - 0.005, 0), t0)
    curve.getTangentAt(Math.min(t + 0.005, 1), t1)
    const bank = THREE.MathUtils.clamp((t1.x - t0.x) * -6, -0.35, 0.35)
    camera.rotation.z += bank

    setSectionFromProgress(t)
    emitProgress(t)
  })
  return null
}

function Stars() {
  const geo = useMemo(() => {
    const n = 2600
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      pos[i * 3 + 0] = THREE.MathUtils.randFloatSpread(140)
      pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(90)
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(20, -170)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  const mat = useMemo(
    () => new THREE.PointsMaterial({ color: '#f4f2f0', size: 0.07, sizeAttenuation: true, transparent: true, opacity: 0.75, depthWrite: false }),
    [],
  )
  const ref = useRef()
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.004 })
  return <points ref={ref} geometry={geo} material={mat} />
}

// dashed guide line along the whole flight path
function FlightPath() {
  const line = useMemo(() => {
    const pts = curve.getPoints(500)
    const g = new THREE.BufferGeometry().setFromPoints(pts)
    const m = new THREE.LineDashedMaterial({ color: '#f4f2f0', transparent: true, opacity: 0.22, dashSize: 0.35, gapSize: 0.65 })
    const l = new THREE.Line(g, m)
    l.computeLineDistances()
    return l
  }, [])
  return <primitive object={line} position={[0, -1.6, 0]} />
}

function Ready() {
  // first rendered frame => loading is genuinely over
  useLayoutEffect(() => { loader.ready = true }, [])
  return null
}

export default function Experience() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: 55, near: 0.1, far: 80, position: [0, 0, 6] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(BG)
        scene.fog = new THREE.Fog(BG, 9, 46)
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 6]} intensity={0.7} />
      <CameraRig />
      <Stars />
      <FlightPath />
      <Worlds />
      <Ready />
    </Canvas>
  )
}
