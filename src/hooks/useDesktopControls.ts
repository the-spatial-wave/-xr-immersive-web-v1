import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

/**
 * Hook per gestire controlli desktop (keyboard)
 * - Space: Toggle UI / Back to landing
 * - 1-2-3: Scene selection
 */
export function useDesktopControls() {
  const mode = useAppStore(s => s.mode)
  const setMode = useAppStore(s => s.setMode)
  const setScene = useAppStore(s => s.setScene)
  const toggleSceneSelector = useAppStore(s => s.toggleSceneSelector)
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignora se stai scrivendo in un input
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Solo se sei in explore mode
      if (mode !== 'explore') return
      
      switch(e.key) {
        case ' ': // Space
          e.preventDefault()
          // Torna a landing (per ora)
          setMode('landing')
          break
          
        case '1':
          e.preventDefault()
          setScene('scene1')
          console.log('🎬 Scene 1 selected')
          break
          
        case '2':
          e.preventDefault()
          setScene('scene2')
          console.log('🎬 Scene 2 selected')
          break
          
        case '3':
          e.preventDefault()
          setScene('scene3')
          console.log('🎬 Scene 3 selected')
          break
          
        case '?':
          e.preventDefault()
          toggleSceneSelector()
          console.log('❓ Help toggled')
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    // Cleanup quando componente si smonta
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mode, setMode, setScene, toggleSceneSelector])
}