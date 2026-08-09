import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { STATIONS, PAGES } from '../data'
import { scroll, setSectionFromProgress, emitProgress, loader, stationT } from '../store'
import Worlds from './Worlds'

const BG = '#121010'

export const curve = new THREE.CatmullRomCurve3(
  STATIONS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)

// Publish each station's true arc-length fraction (the curve passes through
// control point i at u = i/(N-1); convert that to arc-length space).
{
  const K = 400
  const lens = curve.getLengths(K)
  const total = lens[K]
  STATIONS.forEach((_, i) => {
    stationT[i] = lens[Math.round((i / (STATIONS.length - 1)) * K)] / total
  })
}

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

    // gentle banking only while actually turning; level at stations
    curve.getTangentAt(Math.max(t - 0.005, 0), t0)
    curve.getTangentAt(Math.min(t + 0.005, 1), t1)
    const bank = THREE.MathUtils.clamp((t1.x - t0.x) * -2.2, -0.12, 0.12)
    camera.rotation.z += bank * Math.min(1, Math.abs(scroll.target - scroll.current) * 40)

    setSectionFromProgress(t)
    emitProgress(t)
  })
  return null
}

// soft round sprite for stars/bokeh, drawn once on a canvas
function glowTexture(stops) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  stops.forEach(([o, col]) => g.addColorStop(o, col))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function starGeo(n, spread, zRange) {
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    pos[i * 3 + 0] = THREE.MathUtils.randFloatSpread(spread[0])
    pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(spread[1])
    pos[i * 3 + 2] = THREE.MathUtils.randFloat(zRange[0], zRange[1])
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return g
}

function Stars() {
  const { small, big } = useMemo(() => {
    const dot = glowTexture([[0, 'rgba(255,253,250,1)'], [0.4, 'rgba(255,253,250,0.6)'], [1, 'rgba(255,253,250,0)']])
    return {
      small: {
        geo: starGeo(2600, [140, 90], [20, -170]),
        mat: new THREE.PointsMaterial({ color: '#f4f2f0', size: 0.11, map: dot, alphaMap: dot, sizeAttenuation: true, transparent: true, opacity: 0.8, depthWrite: false }),
      },
      // sparse large bokeh glows drifting far and near
      big: {
        geo: starGeo(70, [120, 70], [15, -165]),
        mat: new THREE.PointsMaterial({ color: '#f4f2f0', size: 1.6, map: dot, alphaMap: dot, sizeAttenuation: true, transparent: true, opacity: 0.35, depthWrite: false }),
      },
    }
  }, [])
  const ref = useRef()
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.004 })
  return (
    <group ref={ref}>
      <points geometry={small.geo} material={small.mat} />
      <points geometry={big.geo} material={big.mat} />
    </group>
  )
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
