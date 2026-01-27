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
        <p className="subtitle">• Lyra Hub • </p>
      </div>
      
      <div className="cta-group">
        <button 
          className="btn-primary" 
          disabled
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
          title="VR Mode coming soon!"
        >
          Enter VR <span className="dimmed">(Coming Soon)</span>
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