import { create } from 'zustand'

// ============================================
// INTERFACE - Definisce la struttura dello state
// ============================================
interface AppState {
  // === DATI (STATE) ===
  
  // Modalità corrente dell'app
  mode: 'landing' | 'explore' | 'xr'
  
  // Scena attualmente attiva
  currentSceneId: 'scene1' | 'scene2' | 'scene3' | 'scene4'

  // Profilo risultante dal quiz XR Reset
  quizProfile: 'navigator' | 'architect' | 'alchemist' | null
  
  // Stato UI (pannelli aperti/chiusi)
  ui: {
    helpOpen: boolean              // Controls panel aperto?
    sceneSelectorOpen: boolean     // Scene selector aperto?
  }
  
  // Sessione XR attiva o no
  xrSessionActive: boolean

  // Audio voice over gia' riprodotto
  voiceOverPlayed: boolean

  // Riferimento audio Scene2 (voiceover globale)
  scene2AudioRef: HTMLAudioElement | null

  // Riferimento audio quiz ambient
  quizAudioRef: HTMLAudioElement | null

  // === AZIONI (FUNCTIONS) ===
  
  // Cambia modalità (landing/explore/xr)
  setMode: (mode: AppState['mode']) => void
  
  // Cambia scena corrente
  setScene: (sceneId: AppState['currentSceneId']) => void

  // Imposta profilo quiz
  setQuizProfile: (profile: 'navigator' | 'architect' | 'alchemist') => void

  // Apre/chiude help panel
  toggleHelp: () => void
  
  // Apre/chiude scene selector
  toggleSceneSelector: () => void
  
  // Imposta stato sessione XR
  setXRSession: (active: boolean) => void

  // Imposta voice over come riprodotto
  setVoiceOverPlayed: () => void

  // Resetta voice over (per riproduzione successiva)
  resetVoiceOver: () => void

  // Imposta riferimento audio Scene2
  setScene2AudioRef: (ref: HTMLAudioElement | null) => void

  // Pausa audio Scene2 (stop sincrono)
  pauseScene2Audio: () => void

  // Imposta riferimento audio quiz
  setQuizAudioRef: (ref: HTMLAudioElement | null) => void
}

// ============================================
// STORE - Implementazione con Zustand
// ============================================
export const useAppStore = create<AppState>((set) => ({
  // === VALORI INIZIALI ===
  mode: 'landing',                    // App parte da landing screen
  currentSceneId: 'scene1',           // Parte da Scene 1
  quizProfile: null,                  // Nessun profilo inizialmente
  ui: {
    helpOpen: false,                  // Help chiuso di default
    sceneSelectorOpen: false          // Scene selector chiuso di default
  },
  xrSessionActive: false,             // No XR all'inizio
  voiceOverPlayed: false,             // Voice over non ancora riprodotto
  scene2AudioRef: null,               // Nessun audio Scene2 attivo
  quizAudioRef: null,                 // Nessun audio quiz attivo

  // === IMPLEMENTAZIONE AZIONI ===
  
  // Cambia mode
  setMode: (mode) => set({ mode }),

  // Cambia scena
  setScene: (sceneId) => set({ currentSceneId: sceneId }),

  // Imposta profilo quiz
  setQuizProfile: (profile) => set({ quizProfile: profile }),

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

  // Imposta voice over come riprodotto
  setVoiceOverPlayed: () => set({ voiceOverPlayed: true }),

  // Resetta voice over (per riproduzione successiva)
  resetVoiceOver: () => set({ voiceOverPlayed: false }),

  // Imposta riferimento audio Scene2
  setScene2AudioRef: (ref) => set({ scene2AudioRef: ref }),

  // Pausa audio Scene2 (stop sincrono)
  pauseScene2Audio: () => {
    const state = useAppStore.getState()
    if (state.scene2AudioRef) {
      state.scene2AudioRef.pause()
      state.scene2AudioRef.currentTime = 0
      console.log('🔇 Scene2 audio stopped (sync call)')
    }
  },

  // Imposta riferimento audio quiz
  setQuizAudioRef: (ref) => set({ quizAudioRef: ref }),
}))