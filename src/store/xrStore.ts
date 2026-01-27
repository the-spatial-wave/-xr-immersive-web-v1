import { createXRStore } from '@react-three/xr'

/**
 * XR Store - Gestisce sessione WebXR
 * 
 * Metodi:
 * - enterVR(): Entra in modalità VR
 * - enterAR(): Entra in modalità AR (futuro)
 * - exit(): Esci da XR
 */
export const xrStore = createXRStore()

// Log XR store ready
console.log('🥽 XR Store initialized')
