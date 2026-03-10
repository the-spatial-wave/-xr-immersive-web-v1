import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { useDesktopControls } from './hooks/useDesktopControls'
import { Landing } from './components/Landing/Landing'
import { ControlsOverlay } from './components/UI/ControlsOverlay'
import { SceneSelector } from './components/UI/SceneSelector'
import Scene1 from './components/scenes/Scene1'
import Scene2 from './components/scenes/Scene2'
// import Scene2New from './components/scenes/Scene2New'
import Scene3 from './components/scenes/Scene3'
import Scene4 from './components/scenes/Scene4'
import { xrStore } from './store/xrStore'
import { FEATURES } from './config/features'
import './App.css'

function App() {
  const mode = useAppStore(s => s.mode)
  const currentSceneId = useAppStore(s => s.currentSceneId)
  const quizProfile = useAppStore(s => s.quizProfile)
  const sceneSelectorOpen = useAppStore(s => s.ui.sceneSelectorOpen)
  const setScene = useAppStore(s => s.setScene)
  
  useDesktopControls()
  
  // 🎯 Navigation handler for scene transitions
  const navigateToScene = (sceneNumber: number) => {
    console.log(`🎬 Navigating to Scene ${sceneNumber}`)

    const sceneMap: Record<number, 'scene1' | 'scene2' | 'scene3' | 'scene4'> = {
      1: 'scene1',
      2: 'scene2',
      3: 'scene3',
      4: 'scene4'
    }
    
    const sceneId = sceneMap[sceneNumber]

    if (sceneId) {
      setScene(sceneId)
    } else {
      console.warn(`⚠️ Scene ${sceneNumber} not implemented yet`)
    }
  }
  
  // 🚧 VR MASTER GUARD
  useEffect(() => {
    if (!FEATURES.VR_ENABLED && mode === 'xr') {
      console.warn('⚠️ VR Mode blocked - Feature disabled in config/features.ts')
      
      alert(
        "🚧 VR Mode Coming Soon!\n\n" +
        "Stiamo lavorando a un'esperienza VR completa.\n" +
        "Per ora LYRA Hub è disponibile in Desktop mode.\n\n" +
        "Stay tuned! 🚀"
      )
      
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
        🎬 SCENE RENDERING - WITH NAVIGATION FIX
        Importante: onNavigate prop aggiunto a tutte le scene
      */}
      
      {mode === 'explore' && currentSceneId === 'scene1' && (
        <Scene1 
          xrStore={xrStore} 
          vrEnabled={FEATURES.VR_ENABLED}
          onNavigate={navigateToScene}
        />
      )}
      
      {mode === 'explore' && currentSceneId === 'scene2' && (
        <Scene2
          xrStore={xrStore}
          vrEnabled={FEATURES.VR_ENABLED}
          onNavigate={navigateToScene}
        />
      )}
      
      {mode === 'explore' && currentSceneId === 'scene3' && (
        <Scene3
          xrStore={xrStore}
          vrEnabled={FEATURES.VR_ENABLED}
          onNavigate={navigateToScene}
        />
      )}

      {mode === 'explore' && currentSceneId === 'scene4' && (
        <Scene4
          profile={quizProfile || 'navigator'}
          onRestart={() => setScene('scene1')}
          onBack={() => setScene('scene2')}
        />
      )}
    </>
  )
}

export default App