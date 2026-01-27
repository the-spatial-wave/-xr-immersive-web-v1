import { useAppStore } from '../../store/appStore'
import './Landing.css'

export function Landing() {
  const setMode = useAppStore(s => s.setMode)
  const toggleSceneSelector = useAppStore(s => s.toggleSceneSelector)
  
  return (
    <div className="landing-overlay">
      <div className="hero">
        <div className="badge">XR Reset • Experience</div>
        <h1 className="title">THIS IS THE GAME CHANGER</h1>
        <p className="subtitle">Lyra Hub • Scene 1 • Cinematic intro</p>
      </div>
      
      <div className="cta-group">
        <button 
          className="btn-primary" 
          onClick={() => setMode('xr')}
        >
          Enter VR
        </button>
        
        <button 
          className="btn-secondary" 
          onClick={() => setMode('explore')}
        >
          Explore <span className="dimmed">(desktop)</span>
        </button>
        
        <button 
          className="btn-tertiary" 
          onClick={toggleSceneSelector}
        >
          Scegli scena
        </button>
      </div>
      
      <div className="controls-hint">
        Drag = rotate • Wheel = zoom • Scegli scena
      </div>
    </div>
  )
}