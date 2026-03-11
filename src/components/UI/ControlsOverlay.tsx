import { useAppStore } from '../../store/appStore'
import './ControlsOverlay.css'

export function ControlsOverlay() {
  const setMode = useAppStore(s => s.setMode)
  const toggleSceneSelector = useAppStore(s => s.toggleSceneSelector)
  const currentSceneId = useAppStore(s => s.currentSceneId)

  // Hide controls in Scene4 (quiz results/CTA page)
  if (currentSceneId === 'scene4') {
    return null
  }

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
