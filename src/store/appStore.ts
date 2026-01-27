import { create } from 'zustand'

// ============================================
// INTERFACE - Definisce la struttura dello state
// ============================================
interface AppState {
  // === DATI (STATE) ===
  
  // Modalità corrente dell'app
  mode: 'landing' | 'explore' | 'xr'
  
  // Scena attualmente attiva
  currentSceneId: 'scene1' | 'scene2' | 'scene3'
  
  // Stato UI (pannelli aperti/chiusi)
  ui: {
    helpOpen: boolean              // Controls panel aperto?
    sceneSelectorOpen: boolean     // Scene selector aperto?
  }
  
  // Sessione XR attiva o no
  xrSessionActive: boolean
  
  // === AZIONI (FUNCTIONS) ===
  
  // Cambia modalità (landing/explore/xr)
  setMode: (mode: AppState['mode']) => void
  
  // Cambia scena corrente
  setScene: (sceneId: AppState['currentSceneId']) => void
  
  // Apre/chiude help panel
  toggleHelp: () => void
  
  // Apre/chiude scene selector
  toggleSceneSelector: () => void
  
  // Imposta stato sessione XR
  setXRSession: (active: boolean) => void
}

// ============================================
// STORE - Implementazione con Zustand
// ============================================
export const useAppStore = create<AppState>((set) => ({
  // === VALORI INIZIALI ===
  mode: 'landing',                    // App parte da landing screen
  currentSceneId: 'scene1',           // Parte da Scene 1
  ui: { 
    helpOpen: false,                  // Help chiuso di default
    sceneSelectorOpen: false          // Scene selector chiuso di default
  },
  xrSessionActive: false,             // No XR all'inizio
  
  // === IMPLEMENTAZIONE AZIONI ===
  
  // Cambia mode
  setMode: (mode) => set({ mode }),
  
  // Cambia scena
  setScene: (sceneId) => set({ currentSceneId: sceneId }),
  
  // Toggle help (apre se chiuso, chiude se aperto)
  toggleHelp: () => set((state) => ({ 
    ui: { ...state.ui, helpOpen: !state.ui.helpOpen } 
  })),
  
  // Toggle scene selector (CON DEBUG LOG)
  toggleSceneSelector: () => set((state) => {
    console.log('🔄 toggleSceneSelector chiamato!')
    console.log('   Stato attuale:', state.ui.sceneSelectorOpen)
    console.log('   Nuovo stato:', !state.ui.sceneSelectorOpen)
    return { 
      ui: { ...state.ui, sceneSelectorOpen: !state.ui.sceneSelectorOpen } 
    }
  }),
  
  // Imposta stato XR session
  setXRSession: (active) => set({ xrSessionActive: active }),
}))