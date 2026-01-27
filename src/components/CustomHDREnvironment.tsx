// ============================================
// CUSTOM HDR ENVIRONMENT LOADER - With Rotation
// Versione con controllo rotazione orizzonte
// ============================================

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

interface CustomHDREnvironmentProps {
  path: string;
  background?: boolean;
  blur?: number;
  intensity?: number;
  rotationY?: number;  // Rotazione orizzontale (sinistra/destra)
  offsetY?: number;    // Offset verticale (su/giù)
}

export default function CustomHDREnvironment({
  path,
  background = true,
  blur = 0.9,
  intensity = 1.0,
  rotationY = 0,      // Default: nessuna rotazione
  offsetY = 0         // Default: nessun offset
}: CustomHDREnvironmentProps) {
  const { scene, gl } = useThree();

  useEffect(() => {
    const loader = new RGBELoader();
    
    console.log('🌌 Caricamento HDR:', path);

    loader.load(
      path,
      (texture) => {
        console.log('✅ HDR caricato con successo!');
        
        // Configura texture
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        // Applica rotazione se specificata
        if (rotationY !== 0) {
          texture.center.set(0.5, 0.5);
          texture.rotation = rotationY;
          console.log(`🔄 Rotazione HDR: ${(rotationY * 180 / Math.PI).toFixed(0)}°`);
        }
        
        // Applica offset verticale se specificato
        if (offsetY !== 0) {
          texture.offset.y = offsetY;
          texture.wrapT = THREE.RepeatWrapping;
          console.log(`⬆️ Offset verticale HDR: ${offsetY}`);
        }
        
        // Applica blur e genera environment map
        if (blur > 0) {
          const pmremGenerator = new THREE.PMREMGenerator(gl);
          pmremGenerator.compileEquirectangularShader();
          
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          
          // Applica intensity
          if (intensity !== 1.0) {
            envMap.userData.intensity = intensity;
          }
          
          // Imposta come environment per materiali
          scene.environment = envMap;
          
          // Imposta come background se richiesto
          if (background) {
            scene.background = envMap;
          }
          
          // Cleanup
          texture.dispose();
          pmremGenerator.dispose();
          
        } else {
          // Senza blur, usa texture diretta
          scene.environment = texture;
          
          if (background) {
            scene.background = texture;
          }
        }
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`📥 Loading HDR: ${percent.toFixed(0)}%`);
      },
      (err) => {
        console.error('❌ Errore caricamento HDR:', err);
      }
    );

    // Cleanup quando componente unmount
    return () => {
      if (scene.environment instanceof THREE.Texture) {
        scene.environment.dispose();
        scene.environment = null;
      }
      if (scene.background instanceof THREE.Texture) {
        scene.background.dispose();
        scene.background = null;
      }
    };
  }, [path, scene, gl, background, blur, intensity, rotationY, offsetY]);

  return null;
}