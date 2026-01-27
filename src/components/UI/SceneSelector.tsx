import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { SceneCard } from './SceneCard'
import './SceneSelector.css'

export function SceneSelector() {
  const setScene = useAppStore(s => s.setScene)
  const setMode = useAppStore(s => s.setMode)
  const toggleSceneSelector = useAppStore(s => s.toggleSceneSelector)
  
  // Chiudi con ESC
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        toggleSceneSelector()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [toggleSceneSelector])
  
  // Handle scene selection
  function handleSceneEnter(sceneId: 'scene1' | 'scene2' | 'scene3') {
    setScene(sceneId)
    setMode('explore')
    toggleSceneSelector()
    console.log(`🎬 Entering ${sceneId}`)
  }
  
  return (
    <div className="scene-selector-overlay" onClick={toggleSceneSelector}>
      <div className="scene-selector-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="scene-selector-header">
          <h2>Seleziona Scena</h2>
          <button 
            className="close-btn"
            onClick={toggleSceneSelector}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        {/* Scene Cards Grid */}
        <div className="scene-cards-grid">
          <SceneCard
            title="Scene 1 —"
            subtitle="Game Changer (Intro)"
            badge="Desktop + VR"
            thumbnail="/placeholder-scene1.jpg"
            onEnter={() => handleSceneEnter('scene1')}
          />
          
          <SceneCard
            title="Scene 2 —"
            subtitle="XR Reset (Cards)"
            badge="VR only"
            thumbnail="/placeholder-scene2.jpg"
            onEnter={() => handleSceneEnter('scene2')}
          />
          
          <SceneCard
            title="Scene 3 —"
            subtitle="Showroom (Controllo)"
            badge="Desktop + VR"
            thumbnail="/placeholder-scene3.jpg"
            onEnter={() => handleSceneEnter('scene3')}
          />
        </div>
      </div>
    </div>
  )
}