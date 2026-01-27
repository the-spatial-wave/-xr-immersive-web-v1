/**
 * LYRA Hub - Feature Flags
 * Centralizza tutte le feature toggles del progetto
 */

export const FEATURES = {
  /**
   * VR Mode - Master Switch
   * Quando false: VR completamente disabilitato
   * Quando true: VR completamente funzionante
   */
  VR_ENABLED: false,
  
  // Metadata (per debugging e documentazione)
  VR_STATUS: 'coming-soon' as 'coming-soon' | 'in-development' | 'beta' | 'stable',
  VR_REASON: 'VR experience under development - Desktop mode only',
  
  // Future features (espandibile)
  // WEB3_ENABLED: false,
  // ANALYTICS_ENABLED: true,
} as const;

// Helper per logging
export const getFeatureStatus = (feature: keyof typeof FEATURES) => {
  return {
    enabled: FEATURES[feature],
    timestamp: new Date().toISOString()
  };
};