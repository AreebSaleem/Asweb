import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Text3D from './Text3D'
import { curve } from './Experience'
import { STATIONS, IDENTITY, PITCH, DECADE, STORY, NUMBERS, CASES, TALKS, MANIFESTO, CONTACT, FAQ } from '../data'
import { openModal } from '../store-modal'

const INK = '#f4f2f0'

// A group parked at a station, yawed (only) to face the camera's approach —
// content stays upright and reads flat, like the reference experience.
function Station({ index, children }) {
  const { position, rotationY } = useMemo(() => {
    const p = new THREE.Vector3(...STATIONS[index])
    const t = index / (STATIONS.length - 1)
    const tan = curve.getTangentAt(Math.max(0.001, Math.min(0.999, t)))
    return { position: p, rotationY: Math.atan2(-tan.x, -tan.z) }
  }, [index])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {children}
    </group>
  )
}

function Bob({ amp = 0.15, freq = 0.5, phase = 0, children, ...props }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * freq + phase) * amp
  })
  return <group {...props}><group ref={ref}>{children}</group></group>
}

// slowly spinning 4-point sparkle (two crossed thin planes)
function Sparkle({ scale = 0.14, speed = 0.4, ...props }) {
  const ref = useRef()
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * speed })
  return (
    <group ref={ref} scale={scale} {...props}>
      <mesh><planeGeometry args={[1, 0.08]} /><meshBasicMaterial color={INK} transparent opacity={0.8} fog /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><planeGeometry args={[1, 0.08]} /><meshBasicMaterial color={INK} transparent opacity={0.8} fog /></mesh>
    </group>
  )
}

// faint drifting tetra debris between stations (kept subtle)
function Shards() {
  const ref = useRef()
  const count = 140
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: INK, wireframe: true, transparent: true, opacity: 0.14, fog: true }), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        p: new THREE.Vector3(THREE.MathUtils.randFloatSpread(80), THREE.MathUtils.randFloatSpread(46), THREE.MathUtils.randFloat(15, -160)),
        r: Math.random() * Math.PI * 2,
        s: THREE.MathUtils.randFloat(0.05, 0.3),
        v: THREE.MathUtils.randFloat(0.05, 0.25),
      })),
    [],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    seeds.forEach((seed, i) => {
      dummy.position.copy(seed.p)
      dummy.position.y += Math.sin(t * seed.v + seed.r) * 0.5
      dummy.rotation.set(seed.r + t * seed.v, seed.r * 2 + t * seed.v * 0.7, 0)
      dummy.scale.setScalar(seed.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={mat} frustumCulled={false}>
      <tetrahedronGeometry args={[1, 0]} />
    </instancedMesh>
  )
}

// ---- sections -------------------------------------------------------------

function Intro() {
  return (
    <Station index={0}>
      <group position={[0, 0.2, -7]}>
        {/* name block, left of center; outline first name, solid last */}
        <group position={[-2.2, 0.7, 0]}>
          <Text3D variant="display" size={0.72} letterSpacing={0.04} anchorX="left" position={[0, 0.8, 0]}
            fillOpacity={0} strokeColor={INK} strokeWidth={'2.5%'}>{IDENTITY.first}</Text3D>
          <Text3D variant="display" size={0.86} letterSpacing={0.03} anchorX="left" position={[0, -0.05, 0]}>{IDENTITY.last}</Text3D>
          <Text3D size={0.2} opacity={0.6} letterSpacing={0.35} anchorX="left" position={[0, -0.75, 0]}>{IDENTITY.alias}</Text3D>
          {IDENTITY.roles.map((r, i) => (
            <group key={r} position={[0.1, -1.45 - i * 0.42, 0]}>
              <Sparkle scale={0.1} speed={0.3 + i * 0.2} position={[-0.05, 0, 0]} />
              <Text3D size={0.26} opacity={0.85} anchorX="left" position={[0.25, 0, 0]}>{r}</Text3D>
            </group>
          ))}
        </group>
        {/* tilted empty portrait frame, placeholder for a photo */}
        <Bob amp={0.08} freq={0.4}>
          <group position={[2.9, -0.1, -0.4]} rotation={[0, -0.12, -0.05]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(1.9, 1.75)]} />
              <lineBasicMaterial color={INK} transparent opacity={0.65} fog />
            </lineSegments>
            <Text3D size={0.1} opacity={0.35} letterSpacing={0.3}>YOUR PORTRAIT</Text3D>
          </group>
        </Bob>
      </group>
    </Station>
  )
}

function Pitch() {
  return (
    <Station index={1}>
      <group position={[0, 0, -6.5]}>
        <Text3D size={0.16} opacity={0.5} letterSpacing={0.5} position={[0, 1.35, 0]}>{PITCH.title.toUpperCase()}</Text3D>
        <Text3D variant="light" size={0.4} opacity={0.95} lineHeight={1.35} maxWidth={8.6} position={[0, 0.15, 0]}>{PITCH.body}</Text3D>
        <Sparkle position={[-4.6, 0.1, 0]} />
        <Sparkle position={[4.6, 0.1, 0]} speed={-0.3} />
      </group>
    </Station>
  )
}

function Decade() {
  // a wall of invented wordmarks at varying depth — same pattern, no real brands
  const marks = [
    { t: 'cybra',      s: 0.34, p: [-2.6,  0.55, -0.6], o: 0.75 },
    { t: 'AMPLE',      s: 0.24, p: [-1.0,  0.20, -1.6], o: 0.5  },
    { t: 'nooma°',     s: 0.42, p: [ 2.4,  0.45,  0.2], o: 0.9  },
    { t: 'mass[data]', s: 0.2,  p: [ 0.6,  0.35, -2.4], o: 0.45 },
    { t: 'WaveBoard',  s: 0.2,  p: [ 0.9, -0.05, -1.2], o: 0.5  },
    { t: 'amadora',    s: 0.26, p: [-0.4, -0.35, -0.8], o: 0.6  },
    { t: 'on:go',      s: 0.22, p: [-1.7, -0.85, -0.2], o: 0.65 },
    { t: 'Orbium',     s: 0.2,  p: [ 1.5, -0.9,  -0.5], o: 0.6  },
  ]
  return (
    <Station index={2}>
      <group position={[0, 0.2, -6.5]}>
        {marks.map((m, i) => (
          <Bob key={m.t} amp={0.06} phase={i * 1.7} freq={0.35}>
            <Text3D variant={i % 3 === 0 ? 'bold' : 'body'} size={m.s} opacity={m.o} position={m.p}>{m.t}</Text3D>
          </Bob>
        ))}
        <Text3D size={0.13} opacity={0.4} letterSpacing={0.4} position={[0, -1.7, 0]}>{DECADE.title.toUpperCase()} — {DECADE.body.split('\n')[0].toUpperCase()}</Text3D>
      </group>
    </Station>
  )
}

function Story() {
  return (
    <Station index={3}>
      <group position={[0, 0.1, -6]}>
        <Text3D variant="light" size={0.34} opacity={0.8} anchorX="left" position={[-2.2, 0.9, 0]}>{STORY.title}</Text3D>
        {STORY.body.split('\n').map((line, i) => (
          <group key={line} position={[-2.2, 0.35 - i * 0.34, 0]}>
            <Text3D size={0.09} opacity={0.4} anchorX="left" position={[0, 0, 0]}>✳</Text3D>
            <Text3D size={0.17} opacity={0.65} anchorX="left" position={[0.25, 0, 0]}>{line}</Text3D>
          </group>
        ))}
        <Sparkle position={[2.8, -0.7, -1]} scale={0.1} />
      </group>
    </Station>
  )
}

function Numbers() {
  // sparse outline numerals with small labels, scattered in depth
  const spots = [
    { v: '+80', l: 'ship cycles run',      s: 1.0,  p: [-2.4,  0.55, -0.4] },
    { v: '6',   l: 'years of product',     s: 1.15, p: [ 1.4,  0.05, -0.1] },
    { v: '7',   l: 'awards won',           s: 0.7,  p: [ 0.2,  0.4,  -2.2] },
    { v: '50%', l: 'faster onboarding',    s: 0.55, p: [-0.9, -0.75, -1.4] },
    { v: '3',   l: 'products at PMF',      s: 0.6,  p: [ 3.1,  0.85, -1.8] },
    { v: '30+', l: 'teams mentored',       s: 0.5,  p: [ 2.4, -0.95, -0.9] },
  ]
  return (
    <Station index={4}>
      <group position={[0, 0, -6.5]}>
        {spots.map((n, i) => (
          <Bob key={n.l} amp={0.05} phase={i * 2.1} freq={0.3}>
            <group position={n.p}>
              <Text3D variant="display" size={n.s} fillOpacity={0} strokeColor={INK} strokeWidth={'2%'} opacity={0.9} anchorX="right" position={[-0.08, 0, 0]}>{n.v}</Text3D>
              <Text3D size={0.16} opacity={0.6} anchorX="left" position={[0.12, -0.1, 0]}>{n.l}</Text3D>
            </group>
          </Bob>
        ))}
      </group>
    </Station>
  )
}

function CaseRow({ index, title, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <group
      onClick={onClick}
      onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
    >
      <mesh position={[0.6, 0, -0.01]} visible={false}><planeGeometry args={[7.5, 0.75]} /><meshBasicMaterial /></mesh>
      <Text3D variant="display" size={0.42} fillOpacity={0} strokeColor={INK} strokeWidth={'2.5%'} opacity={hover ? 1 : 0.75} anchorX="right" position={[-2.2, 0, 0]}>{`${index + 1}.`}</Text3D>
      <Text3D variant="light" size={0.34} opacity={hover ? 1 : 0.8} anchorX="left" position={[-1.7, 0, 0]}>{title}</Text3D>
    </group>
  )
}

function Cases() {
  return (
    <Station index={5}>
      <group position={[0, 0, -7]}>
        <Text3D variant="light" size={0.5} position={[0, 1.75, 0]}>{CASES.title}</Text3D>
        <Text3D size={0.13} opacity={0.45} letterSpacing={0.45} position={[0, 1.25, 0]}>CLICK TO EXPAND</Text3D>
        {CASES.items.map((c, i) => (
          <group key={c.title} position={[0, 0.45 - i * 0.85, 0]}>
            <CaseRow index={i} title={c.title} onClick={() => openModal({ type: 'case', index: i })} />
          </group>
        ))}
      </group>
    </Station>
  )
}

function TalkCard({ item, index, onClick }) {
  const [hover, setHover] = useState(false)
  const tex = useMemo(() => new THREE.TextureLoader().load(item.img), [item.img])
  return (
    <group
      onClick={onClick}
      onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
    >
      <mesh>
        <planeGeometry args={[2.4, 1.35]} />
        <meshBasicMaterial map={tex} transparent opacity={hover ? 1 : 0.85} fog />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.4, 1.35)]} />
        <lineBasicMaterial color={INK} transparent opacity={hover ? 0.8 : 0.3} fog />
      </lineSegments>
      <Text3D variant="light" size={0.17} anchorX="left" anchorY="top" maxWidth={2.4} position={[-1.2, -0.82, 0]}>{item.title}</Text3D>
      <Text3D size={0.1} opacity={0.5} anchorX="left" anchorY="top" position={[-1.2, -1.28, 0]}>{`${item.tags.join(' · ')} — ${item.meta} · WATCH ▸`}</Text3D>
    </group>
  )
}

function Talks() {
  // sequential cards staggered into depth — the flight passes one at a time
  return (
    <Station index={6}>
      <group position={[0, 0.1, -5.5]}>
        {TALKS.items.map((tk, i) => (
          <Bob key={tk.title} amp={0.05} phase={i * 1.3} freq={0.35}>
            <group position={[(i % 2 ? 1.4 : -1.4) * (1 + (i % 3) * 0.25), (i % 3 - 1) * 0.55, -i * 2.6]}>
              <TalkCard item={tk} index={i} onClick={() => openModal({ type: 'talk', index: i })} />
            </group>
          </Bob>
        ))}
        <Text3D size={0.13} opacity={0.45} letterSpacing={0.45} position={[0, 1.9, 0]}>{TALKS.title.toUpperCase()} — CLICK A CARD</Text3D>
      </group>
    </Station>
  )
}

function Manifesto() {
  return (
    <Station index={7}>
      <group position={[0, 0.1, -6.5]}>
        <Text3D size={0.15} opacity={0.5} letterSpacing={0.5} position={[0, 1.9, 0]}>{MANIFESTO.title.toUpperCase()}</Text3D>
        {MANIFESTO.lines.map((line, i) => (
          <Text3D key={line} variant={i % 2 ? 'light' : 'bold'} size={i % 2 ? 0.3 : 0.36} opacity={0.9}
            position={[0, 1.05 - i * 0.75, 0]} maxWidth={9.5}>{line}</Text3D>
        ))}
        <Sparkle position={[-4.4, 1.4, -1]} />
        <Sparkle position={[4.4, -1.2, -1]} speed={-0.35} />
      </group>
    </Station>
  )
}

function Contact() {
  return (
    <Station index={8}>
      <group position={[0, 0.1, -6.5]}>
        <Text3D variant="display" size={0.82} letterSpacing={0.04} position={[0, 0.75, 0]}>{CONTACT.title.toUpperCase()}</Text3D>
        <Text3D variant="light" size={0.24} opacity={0.7} position={[0, -0.1, 0]}>{CONTACT.body}</Text3D>
        <Text3D size={0.16} opacity={0.8} letterSpacing={0.2} position={[0, -0.75, 0]}>{CONTACT.links.map((l) => l.label.toUpperCase()).join('   ·   ')}</Text3D>
        <Text3D variant="light" size={0.15} opacity={0.45} position={[0, -1.9, 0]} maxWidth={8.5}>{FAQ[0] + '\n' + FAQ[1]}</Text3D>
        <Sparkle position={[-3.6, 1.6, -1]} scale={0.18} />
        <Sparkle position={[3.8, 1.2, -2]} scale={0.12} speed={-0.4} />
      </group>
    </Station>
  )
}

export default function Worlds() {
  return (
    <>
      <Shards />
      <Intro />
      <Pitch />
      <Decade />
      <Story />
      <Numbers />
      <Cases />
      <Talks />
      <Manifesto />
      <Contact />
    </>
  )
}
