import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Text3D from './Text3D'
import { curve } from './Experience'
import { STATIONS, IDENTITY, PITCH, DECADE, STORY, NUMBERS, CASES, TALKS, MANIFESTO, CONTACT, FAQ } from '../data'
import { openModal } from '../store-modal'

const INK = '#f4f2f0'
const wire = (opacity = 0.6) =>
  new THREE.MeshBasicMaterial({ color: INK, wireframe: true, transparent: true, opacity, fog: true })

// A group parked at a station, rotated to face the camera's approach tangent.
function Station({ index, children }) {
  const { position, quaternion } = useMemo(() => {
    const p = new THREE.Vector3(...STATIONS[index])
    const t = index / (STATIONS.length - 1)
    const tangent = curve.getTangentAt(Math.max(0.001, Math.min(0.999, t)))
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent)
    return { position: p, quaternion: q }
  }, [index])
  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  )
}

function Spin({ speed = 0.15, axis = 'y', children, ...props }) {
  const ref = useRef()
  useFrame((_, dt) => { if (ref.current) ref.current.rotation[axis] += dt * speed })
  return <group ref={ref} {...props}>{children}</group>
}

function Bob({ amp = 0.25, freq = 0.6, phase = 0, children, ...props }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * freq + phase) * amp
  })
  return <group {...props}><group ref={ref}>{children}</group></group>
}

// drifting instanced shards that fill space between stations
function Shards() {
  const ref = useRef()
  const count = 260
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        p: new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(70),
          THREE.MathUtils.randFloatSpread(44),
          THREE.MathUtils.randFloat(15, -160),
        ),
        r: Math.random() * Math.PI * 2,
        s: THREE.MathUtils.randFloat(0.08, 0.5),
        v: THREE.MathUtils.randFloat(0.05, 0.3),
      })),
    [],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    seeds.forEach((seed, i) => {
      dummy.position.copy(seed.p)
      dummy.position.y += Math.sin(t * seed.v + seed.r) * 0.6
      dummy.rotation.set(seed.r + t * seed.v, seed.r * 2 + t * seed.v * 0.7, 0)
      dummy.scale.setScalar(seed.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={wire(0.28)} frustumCulled={false}>
      <tetrahedronGeometry args={[1, 0]} />
    </instancedMesh>
  )
}

function Intro() {
  return (
    <Station index={0}>
      <group position={[0, 0.4, -6]}>
        <Text3D variant="display" size={1.1} letterSpacing={0.06} position={[0, 0.75, 0]}>{IDENTITY.first}</Text3D>
        <Text3D variant="display" size={1.1} letterSpacing={0.06} position={[0, -0.55, 0]}>{IDENTITY.last}</Text3D>
        <Text3D size={0.22} color={INK} opacity={0.6} position={[0, -1.6, 0]}>{IDENTITY.alias}</Text3D>
        <Text3D size={0.2} opacity={0.75} position={[0, -2.2, 0]}>{IDENTITY.roles.join('  ·  ')}</Text3D>
        <Spin speed={0.1}>
          <mesh material={wire(0.35)} scale={3.4}>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
        </Spin>
      </group>
    </Station>
  )
}

function Pitch() {
  return (
    <Station index={1}>
      <group position={[0, 0, -5]}>
        <Spin speed={0.25} axis="x">
          <mesh material={wire(0.5)} position={[0, 0.9, -1]} scale={1.1}>
            <torusKnotGeometry args={[1, 0.32, 140, 16]} />
          </mesh>
        </Spin>
        <Text3D variant="bold" size={0.44} position={[0, -0.9, 0]}>{PITCH.title}</Text3D>
        <Text3D size={0.21} opacity={0.72} position={[0, -1.75, 0]} maxWidth={7}>{PITCH.body}</Text3D>
      </group>
    </Station>
  )
}

function Decade() {
  return (
    <Station index={2}>
      <group position={[0, 0, -6]}>
        <Text3D variant="bold" size={0.44} position={[0, 1.9, 0]}>{DECADE.title}</Text3D>
        <Text3D size={0.2} opacity={0.72} position={[0, 1.2, 0]} maxWidth={7}>{DECADE.body}</Text3D>
        {DECADE.years.map((y, i) => (
          <group key={y} position={[(i - 4.5) * 1.15, -0.6, 0]}>
            <Spin speed={0.3 + i * 0.05} axis="x">
              <mesh material={wire(0.5)} scale={0.42}>
                <torusGeometry args={[1, 0.06, 10, 40]} />
              </mesh>
            </Spin>
            <Text3D size={0.13} opacity={0.6} position={[0, -0.75, 0]}>{y}</Text3D>
          </group>
        ))}
      </group>
    </Station>
  )
}

function Story() {
  return (
    <Station index={3}>
      <group position={[0, 0, -5.5]}>
        <Bob amp={0.2}>
          <Spin speed={0.18}>
            <mesh material={wire(0.45)} position={[0, 1.1, -0.5]} scale={1.15}>
              <dodecahedronGeometry args={[1, 0]} />
            </mesh>
          </Spin>
        </Bob>
        <Text3D variant="bold" size={0.44} position={[0, -0.5, 0]}>{STORY.title}</Text3D>
        <Text3D size={0.21} opacity={0.72} position={[0, -1.5, 0]} maxWidth={7.5}>{STORY.body}</Text3D>
      </group>
    </Station>
  )
}

function Numbers() {
  return (
    <Station index={4}>
      <group position={[0, 0, -6]}>
        <Text3D variant="bold" size={0.44} position={[0, 2.1, 0]}>{NUMBERS.title}</Text3D>
        {NUMBERS.stats.map((s, i) => {
          const col = i % 4, row = Math.floor(i / 4)
          return (
            <group key={s.label} position={[(col - 1.5) * 2.5, 0.7 - row * 1.9, 0]}>
              <Text3D variant="display" size={0.5}>{s.value}</Text3D>
              <Text3D size={0.15} opacity={0.6} position={[0, -0.55, 0]} maxWidth={2.2}>{s.label}</Text3D>
            </group>
          )
        })}
        <Spin speed={0.12}>
          <mesh material={wire(0.2)} scale={5.2}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        </Spin>
      </group>
    </Station>
  )
}

function ClickFrame({ position, title, meta, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
      >
        <planeGeometry args={[2.6, 1.7]} />
        <meshBasicMaterial color={hover ? '#2a2626' : '#1a1717'} transparent opacity={0.9} fog />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.6, 1.7)]} />
        <lineBasicMaterial color={INK} transparent opacity={hover ? 0.9 : 0.4} fog />
      </lineSegments>
      <Text3D variant="bold" size={0.14} maxWidth={2.2} position={[0, 0.25, 0.01]}>{title}</Text3D>
      <Text3D size={0.11} opacity={0.55} position={[0, -0.5, 0.01]}>{meta}</Text3D>
    </group>
  )
}

function Cases() {
  return (
    <Station index={5}>
      <group position={[0, 0, -6]}>
        <Text3D variant="bold" size={0.44} position={[0, 1.9, 0]}>{CASES.title}</Text3D>
        {CASES.items.map((c, i) => (
          <Bob key={c.title} amp={0.12} phase={i * 2}>
            <ClickFrame
              position={[(i - 1) * 3.1, 0, 0]}
              title={c.title}
              meta={c.meta}
              onClick={() => openModal({ type: 'case', index: i })}
            />
          </Bob>
        ))}
        <Text3D size={0.14} opacity={0.5} position={[0, -1.6, 0]}>click a frame to open</Text3D>
      </group>
    </Station>
  )
}

function Talks() {
  return (
    <Station index={6}>
      <group position={[0, 0, -6.5]}>
        <Text3D variant="bold" size={0.44} position={[0, 2.3, 0]}>{TALKS.title}</Text3D>
        {TALKS.items.map((tk, i) => {
          const col = i % 3, row = Math.floor(i / 3)
          return (
            <Bob key={tk.title} amp={0.1} phase={i * 1.4}>
              <ClickFrame
                position={[(col - 1) * 3.1, 0.9 - row * 2.1, 0]}
                title={tk.title}
                meta={`${tk.tags.join(' / ')} — ${tk.meta}`}
                onClick={() => openModal({ type: 'talk', index: i })}
              />
            </Bob>
          )
        })}
      </group>
    </Station>
  )
}

function Manifesto() {
  return (
    <Station index={7}>
      <group position={[0, 0, -6]}>
        <Text3D variant="bold" size={0.44} position={[0, 2, 0]}>{MANIFESTO.title}</Text3D>
        {MANIFESTO.lines.map((line, i) => (
          <Text3D key={line} variant={i % 2 ? 'body' : 'bold'} size={i % 2 ? 0.26 : 0.34} opacity={0.85}
            position={[0, 1 - i * 0.85, 0]} maxWidth={9}>{line}</Text3D>
        ))}
        <Spin speed={0.08}>
          <mesh material={wire(0.18)} scale={6}>
            <torusGeometry args={[1, 0.35, 8, 28]} />
          </mesh>
        </Spin>
      </group>
    </Station>
  )
}

function Contact() {
  return (
    <Station index={8}>
      <group position={[0, 0, -6]}>
        <Text3D variant="display" size={0.9} letterSpacing={0.04} position={[0, 0.8, 0]}>{CONTACT.title.toUpperCase()}</Text3D>
        <Text3D size={0.22} opacity={0.7} position={[0, -0.2, 0]}>{CONTACT.body}</Text3D>
        <Text3D size={0.18} opacity={0.5} position={[0, -2.2, 0]} maxWidth={8}>{FAQ[0] + '\n' + FAQ[1]}</Text3D>
        <Spin speed={0.06}>
          <mesh material={wire(0.25)} scale={4.4}>
            <sphereGeometry args={[1, 18, 14]} />
          </mesh>
        </Spin>
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
