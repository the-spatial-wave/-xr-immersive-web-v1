// Force Vercel rebuild - Landing v2 with signature
import { useAppStore } from '../../store/appStore'
import './Landing.css'

export function Landing() {
  const setMode = useAppStore(s => s.setMode)
  const setScene = useAppStore(s => s.setScene)
  const toggleSceneSelector = useAppStore(s => s.toggleSceneSelector)

  const startExperience = () => {
    setScene('scene1')
    setMode('explore')
  }

  return (
    <div className="landing">
      {/* Soft background glows */}
      <div className="landing-bg" />

      <div className="landing-card">
        <div className="landing-pill" aria-label="XR Reset Experience">
          XR RESET • EXPERIENCE
        </div>

        <h1 className="landing-title" aria-label="Lyra Hub">
          <span className="landing-title-lyra">LYRA</span>{' '}
          <span className="landing-title-hub">HUB</span>
        </h1>

        <p className="landing-subtitle">Esperienza Web Immersiva</p>

        <p className="landing-desc">
          Un punto di accesso a contenuti, visioni e ambienti interattivi
          <br />
          dove esplorazione, design e intelligenza artificiale si incontrano.
        </p>

        <div className="landing-actions">
          <button className="btn btn-primary" onClick={startExperience}>
            Inizia l'esperienza
          </button>

          <button className="btn btn-secondary" onClick={toggleSceneSelector}>
            Scegli scena
          </button>
        </div>

        <div className="landing-vr">
          <div className="vr-left">
            <span className="vr-icon" aria-hidden="true">🥽</span>
            <div className="vr-text">
              <div className="vr-title">Modalità VR</div>
              <div className="vr-sub">In sviluppo • Desktop experience attiva</div>
            </div>
          </div>

          <div className="vr-badge" aria-label="Coming soon">
            COMING SOON
          </div>
        </div>

        <div className="landing-hint">
          Trascina = ruota • Pinch/Scroll = zoom
        </div>
      </div>

      {/* Firma */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        textAlign: 'right',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.5,
        letterSpacing: '0.5px',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '2px' }}>Lyra Hub</div>
        <div style={{ fontSize: '10px', opacity: 0.85 }}>An experience by The Spatial Wave</div>
      </div>
    </div>
  )
}