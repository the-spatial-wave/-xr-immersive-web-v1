import { useAppStore } from '../../store/appStore'
import './ControlsOverlay.css'

export function ControlsOverlay() {
  const setMode = useAppStore(s => s.setMode)
  const resetVoiceOver = useAppStore(s => s.resetVoiceOver)
  const currentSceneId = useAppStore(s => s.currentSceneId)

  // Hide controls in Scene3 (quiz) and Scene4 (quiz results/CTA page)
  if (currentSceneId === 'scene3' || currentSceneId === 'scene4') {
    return null
  }

  // Handler per "Home" - resetta voiceOver per permettere replay
  const handleHomeClick = () => {
    resetVoiceOver()
    setMode('landing')
  }

  return (
    <div className="controls-overlay">
      <div className="controls-top">
        <button className="nav-btn nav-back" onClick={handleHomeClick}>
          ← Home
        </button>
      </div>
    </div>
  )
}
