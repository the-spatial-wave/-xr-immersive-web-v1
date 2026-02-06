import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import './SceneSelector.css'

export function SceneSelector() {
  const currentSceneId = useAppStore(s => s.currentSceneId)
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
  function handleSceneEnter(sceneId: 'scene1' | 'scene2' | 'scene3', available: boolean) {
    if (!available) return
    
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
          <h2 className="modal-title">Seleziona Scena</h2>
          <button 
            className="close-btn"
            onClick={toggleSceneSelector}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        {/* Scene Cards Grid */}
        <div className="scene-cards-grid">
          
          {/* SCENE 1 - THIS IS THE GAME CHANGER */}
          <div 
            className={`scene-card ${currentSceneId === 'scene1' ? 'active' : ''}`}
            onClick={() => handleSceneEnter('scene1', true)}
          >
            <div className="scene-thumbnail">
              {currentSceneId === 'scene1' && (
                <div className="scene-badge active">IN CORSO</div>
              )}
            </div>
            
            <div className="scene-content">
              <h3 className="scene-title">THIS IS THE GAME CHANGER</h3>
              <p className="scene-subtitle">
                Incontra Lyra, il tuo assistente AI, in uno spazio immersivo 
                dove esplorazione e intelligenza artificiale si incontrano
              </p>
              
              <button className="scene-enter-btn">
                {currentSceneId === 'scene1' ? 'Attiva' : 'Enter'}
              </button>
            </div>
          </div>
          
          {/* SCENE 2 - XR RESET */}
          <div 
            className="scene-card"
onClick={() => handleSceneEnter('scene2', true)}
          >
            <div className="scene-thumbnail">
              <div className="scene-badge coming-soon">COMING SOON</div>
            </div>
            
            <div className="scene-content">
              <h3 className="scene-title">XR RESET</h3>
              <p className="scene-subtitle">
                Quiz interattivo con card dinamiche per testare 
                le tue conoscenze in un ambiente immersivo
              </p>
              
              <button className="scene-enter-btn" disabled>
                Prossimamente
              </button>
            </div>
          </div>
          
          {/* SCENE 3 - SHOWROOM */}
          <div 
            className="scene-card disabled"
            onClick={() => handleSceneEnter('scene3', false)}
          >
            <div className="scene-thumbnail">
              <div className="scene-badge coming-soon">COMING SOON</div>
            </div>
            
            <div className="scene-content">
              <h3 className="scene-title">SHOWROOM</h3>
              <p className="scene-subtitle">
                Esplora progetti, creazioni e portfolio in uno 
                spazio dedicato con controlli interattivi
              </p>
              
              <button className="scene-enter-btn" disabled>
                Prossimamente
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}