import { useEffect, useRef, useState } from 'react'
import { SECTIONS, TALKS, CASES, PAGES } from '../data'
import { scroll, onSection, onProgress, loader } from '../store'
import { onModal, closeModal } from '../store-modal'

// ---- Loader ---------------------------------------------------------------
export function Loader() {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    let raf, p = 0
    const tick = () => {
      // ramp to 90% while compiling, snap to 100 once the first frame rendered
      const target = loader.ready ? 100 : 90
      p += (target - p) * 0.06
      const shown = Math.min(100, Math.round(p))
      setPct(shown)
      if (shown >= 100) { setTimeout(() => setDone(true), 350); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className={`loader ${done ? 'done' : ''}`} aria-hidden={done}>
      <div className="word">ASWEB</div>
      <div className="pct">{pct}%</div>
    </div>
  )
}

// ---- HUD ------------------------------------------------------------------
function jumpTo(index) {
  scroll.target = index / (SECTIONS.length - 1)
  scroll.moved = true
}

export function Hud() {
  const [active, setActive] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hinted, setHinted] = useState(false)
  const fillRef = useRef()

  useEffect(() => onSection(setActive), [])
  useEffect(() =>
    onProgress((p) => {
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`
      if (p > 0.01) setHinted(true)
    }), [])

  return (
    <div className="overlay">
      <div className="header">
        <div className="brand">
          <img src="/starmark.svg" alt="" width="22" height="22" />
          <span>ASWEB — flight portfolio</span>
        </div>
        <div className="status">portfolio — 2k26</div>
      </div>

      <div className="progress-track"><div className="progress-fill" ref={fillRef} /></div>

      <div className="section-nav">
        {menuOpen && (
          <div className="section-menu">
            {SECTIONS.map((name, i) => (
              <button
                key={name}
                className={i === active ? 'active' : ''}
                onClick={() => { jumpTo(i); setMenuOpen(false) }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span> {name}
              </button>
            ))}
          </div>
        )}
        <button className="section-label" onClick={() => setMenuOpen((v) => !v)}>
          section <b>{SECTIONS[active]}</b>
          <i className={`chev ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      <div className={`hint ${hinted ? 'hidden' : ''}`}>
        <span>scroll to fly</span>
        <div className="line" />
      </div>
    </div>
  )
}

// ---- Modal (talks / case studies) ----------------------------------------
export function Modal() {
  const [state, setState] = useState(null)
  useEffect(() => onModal(setState), [])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
      if (state && e.key === 'ArrowRight') next(1)
      if (state && e.key === 'ArrowLeft') next(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  if (!state) return null

  const list = state.type === 'talk' ? TALKS.items : CASES.items
  const item = list[state.index]
  const next = (d) => setState({ ...state, index: (state.index + d + list.length) % list.length })

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={closeModal} aria-label="close">×</button>
        {state.type === 'talk' ? (
          <>
            <div className="video-frame"><img src={item.img} alt={item.title} /></div>
            <div className="video-caption">
              <h3>{item.title}</h3>
              <div className="chips">{item.tags.map((t) => <span key={t} className="badge">{t}</span>)}</div>
              <p className="meta">{item.meta}</p>
            </div>
          </>
        ) : (
          <div className="case-body">
            <h3>{item.title}</h3>
            <p className="meta">{item.meta}</p>
            <div className="case-metrics">
              {item.metrics.map((m) => <div key={m} className="metric">{m}</div>)}
            </div>
            <p className="case-process">{item.process}</p>
          </div>
        )}
        <div className="deck-nav">
          <button className="prev" onClick={() => next(-1)}>← prev</button>
          <span className="index">{String(state.index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</span>
          <button className="next" onClick={() => next(1)}>next →</button>
        </div>
      </div>
    </div>
  )
}

// ---- Scroller (input surface) ---------------------------------------------
export function Scroller() {
  const ref = useRef()
  useEffect(() => {
    const el = ref.current
    const max = () => el.scrollHeight - el.clientHeight
    const sync = () => { scroll.target = el.scrollTop / max(); scroll.moved = true }

    // wheel / touch / keys all drive the hidden scroller, canvas keeps clicks
    const onWheel = (e) => { el.scrollTop += e.deltaY }
    let lastY = 0
    const onTouchStart = (e) => { lastY = e.touches[0].clientY }
    const onTouchMove = (e) => { el.scrollTop += (lastY - e.touches[0].clientY) * 1.8; lastY = e.touches[0].clientY }
    const onKey = (e) => {
      const vh = el.clientHeight
      const steps = { ArrowDown: vh * 0.4, ArrowUp: -vh * 0.4, PageDown: vh, PageUp: -vh, ' ': vh }
      if (e.key in steps) { el.scrollTop += steps[e.key]; e.preventDefault() }
      if (e.key === 'Home') el.scrollTop = 0
      if (e.key === 'End') el.scrollTop = max()
    }
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])
  return (
    <div className="scroller" ref={ref} aria-hidden="true">
      <div style={{ height: `${PAGES * 100}vh` }} />
    </div>
  )
}
