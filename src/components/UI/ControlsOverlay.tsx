import { useAppStore } from '../../store/appStore'
import './ControlsOverlay.css'

export function ControlsOverlay() {
  const setMode = useAppStore(s => s.setMode)
  const toggleSceneSelector = useAppStore(s => s.toggleSceneSelector)

  return (
    <div className="controls-overlay">
      <div className="controls-top">
        <button className="nav-btn nav-back" onClick={() => setMode('landing')}>
          ← Home
        </button>

        <button className="nav-btn nav-scenes" onClick={toggleSceneSelector}>
          Scegli scena
        </button>
      </div>

      <div className="controls-bottom">
        <p className="hint">Trascina per ruotare • Pinch/Scroll per zoom</p>
      </div>
    </div>
  )
}
