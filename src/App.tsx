import { useAppStore } from './store/appStore'
import { useDesktopControls } from './hooks/useDesktopControls'
import { Landing } from './components/Landing/Landing'
import { ControlsOverlay } from './components/UI/ControlsOverlay'
import { SceneSelector } from './components/UI/SceneSelector'
import Scene1 from './components/scenes/Scene1'
import Scene2 from './components/scenes/Scene2'
import Scene3 from './components/scenes/Scene3'
import { xrStore } from './store/xrStore'
import './App.css'

function App() {
  const mode = useAppStore(s => s.mode)
  const currentSceneId = useAppStore(s => s.currentSceneId)
  const sceneSelectorOpen = useAppStore(s => s.ui.sceneSelectorOpen)
  
  useDesktopControls()
  
  return (
    <>
      {mode === 'landing' && <Landing />}
      {mode === 'explore' && <ControlsOverlay />}
      {sceneSelectorOpen && <SceneSelector />}
      
      {mode === 'xr' && (
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
      
      {(mode === 'explore' || mode === 'xr') && currentSceneId === 'scene1' && (
        <Scene1 xrStore={xrStore} />
      )}
      
      {(mode === 'explore' || mode === 'xr') && currentSceneId === 'scene2' && (
        // @ts-ignore
        <Scene2 xrStore={xrStore} />
      )}
      
      {(mode === 'explore' || mode === 'xr') && currentSceneId === 'scene3' && (
        // @ts-ignore
        <Scene3 xrStore={xrStore} />
      )}
    </>
  )
}

export default App