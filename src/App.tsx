import { useEffect, useState } from 'react'
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

  // Transitioning state for scene changes
  const [transitioning, setTransitioning] = useState(false)

  useDesktopControls()
  
  // Navigation handler for scene transitions with WebGL cleanup delay
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
      // Add transition overlay when navigating to Scene4 to allow WebGL cleanup
      if (sceneNumber === 4) {
        console.log('⏳ Starting transition overlay for WebGL cleanup...')

        // Step 1: Show black overlay
        setTransitioning(true)

        // Step 2: After 800ms, change scene
        setTimeout(() => {
          setScene(sceneId)

          // Step 3: After another 300ms, hide overlay with fade-out
          setTimeout(() => {
            setTransitioning(false)
          }, 300)
        }, 800)
      } else {
        setScene(sceneId)
      }
    } else {
      console.warn(`⚠️ Scene ${sceneNumber} not implemented yet`)
    }
  }
  
  // WebGL context loss handler - graceful recovery
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn('⚠️ WebGL context lost - preventing default behavior')
    }

    const handleContextRestored = () => {
      console.log('✅ WebGL context restored')
      // Force scene reload if needed
      const current = useAppStore.getState().currentSceneId
      useAppStore.getState().setScene(current)
    }

    window.addEventListener('webglcontextlost', handleContextLost)
    window.addEventListener('webglcontextrestored', handleContextRestored)

    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [])

  // VR MASTER GUARD
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
      
      {/* VR Mode Indicator - Solo se feature enabled */}
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
          VR Mode Active
        </div>
      )}

      {/* Global Signature - Always visible except in Landing */}
      {mode !== 'landing' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 60,
          textAlign: 'right',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: '#C8CCD6',
            marginBottom: '4px'
          }}>
            Lyra Hub
          </div>
          <div style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '10px',
            color: 'rgba(183,192,204,0.4)',
            letterSpacing: '1px'
          }}>
            An experience by The Spatial Wave
          </div>
        </div>
      )}

      {/* Transition Overlay - WebGL cleanup during scene changes */}
      {transitioning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: '#000',
          zIndex: 9999,
          opacity: transitioning ? 1 : 0,
          transition: 'opacity 400ms ease-in-out',
          pointerEvents: 'none'
        }} />
      )}

      {/*
        SCENE RENDERING - WITH NAVIGATION FIX
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
          onRestart={() => setScene('scene2')}
          onBack={() => setScene('scene2')}
        />
      )}
    </>
  )
}

export default App