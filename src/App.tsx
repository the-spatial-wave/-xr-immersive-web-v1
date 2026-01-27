import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { useDesktopControls } from './hooks/useDesktopControls'
import { Landing } from './components/Landing/Landing'
import { ControlsOverlay } from './components/UI/ControlsOverlay'
import { SceneSelector } from './components/UI/SceneSelector'
import Scene1 from './components/scenes/Scene1'
import Scene2 from './components/scenes/Scene2'
import Scene3 from './components/scenes/Scene3'
import { xrStore } from './store/xrStore'
import { FEATURES } from './config/features'
import './App.css'

function App() {
  const mode = useAppStore(s => s.mode)
  const currentSceneId = useAppStore(s => s.currentSceneId)
  const sceneSelectorOpen = useAppStore(s => s.ui.sceneSelectorOpen)
  
  useDesktopControls()
  
  // 🚧 VR MASTER GUARD
  // Blocca qualsiasi tentativo di entrare in VR quando feature è disabled
  useEffect(() => {
    if (!FEATURES.VR_ENABLED && mode === 'xr') {
      console.warn('⚠️ VR Mode blocked - Feature disabled in config/features.ts')
      
      alert(
        "🚧 VR Mode Coming Soon!\n\n" +
        "Stiamo lavorando a un'esperienza VR completa.\n" +
        "Per ora LYRA Hub è disponibile in Desktop mode.\n\n" +
        "Stay tuned! 🚀"
      )
      
      // Force return to explore mode
      useAppStore.getState().setMode('explore')
    }
  }, [mode])
  
  return (
    <>
      {/* Landing Screen */}
      {mode === 'landing' && <Landing />}
      
      {/* Desktop Mode UI */}
      {mode === 'explore' && <ControlsOverlay />}
      
      {/* Scene Selector Modal */}
      {sceneSelectorOpen && <SceneSelector />}
      
      {/* 🥽 VR Mode Indicator - Solo se feature enabled */}
      {FEATURES.VR_ENABLED && mode === 'xr' && (
        <div style={{ 
          position: 'fixed', 
          top: 20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(0,255,255,0.15)',
          border: '1px solid rgba(0,255,255,0.3)',
          padding: '10px 20px',
          borderRadius: '8px',
          color: '#00ffff',
          fontSize: '14px',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          pointerEvents: 'none'
        }}>
          🥽 VR Mode Active
        </div>
      )}
      
      {/* 
        🎬 SCENE RENDERING
        Importante: 
        - Solo in explore mode (no 'xr' quando VR disabled)
        - xrStore passato solo se necessario
        - vrEnabled prop per controllo interno
      */}
      
      {mode === 'explore' && currentSceneId === 'scene1' && (
        <Scene1 
          xrStore={xrStore} 
          vrEnabled={FEATURES.VR_ENABLED} 
        />
      )}
      
      {mode === 'explore' && currentSceneId === 'scene2' && (
        <Scene2 
          xrStore={xrStore} 
          vrEnabled={FEATURES.VR_ENABLED} 
        />
      )}
      
      {mode === 'explore' && currentSceneId === 'scene3' && (
        <Scene3 
          xrStore={xrStore} 
          vrEnabled={FEATURES.VR_ENABLED} 
        />
      )}
    </>
  )
}

export default App