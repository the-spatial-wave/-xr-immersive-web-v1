// ============================================
// LYRA CHARACTER - V1.2 ULTRA-DARK
// Massimo contrasto, look cinematografico scuro
// ============================================

import { useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LyraCharacterProps {
  floating?: boolean;
  scale?: number;
  position?: [number, number, number];
}

export default function LyraCharacter({ 
  floating = false, 
  scale = 1,
  position = [0, 0, 0]
}: LyraCharacterProps) {
  const lyraRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/models/lyra_character.glb');
  
  // ========== FLOATING ANIMATION ==========
  useFrame(({ clock }) => {
    if (lyraRef.current && floating) {
      const t = clock.getElapsedTime();
      lyraRef.current.position.y = position[1] + 0.02 + Math.sin(t * 0.8) * 0.04;
    }
  });
  
  // ========== MATERIAL OPTIMIZATION - ULTRA DARK ==========
  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material instanceof THREE.MeshStandardMaterial) {
          // ULTRA-DARK SETTINGS per massimo contrasto
          child.material.envMapIntensity = 0.3;    // MOLTO BASSO - quasi no riflessioni
          child.material.roughness = 0.8;          // MOLTO ALTO - superficie opaca
          child.material.metalness = 0.01;         // MINIMO - quasi zero metallic
          child.material.needsUpdate = true;
        }
      }
    });
  }, [gltf]);

  return (
    <group ref={lyraRef}>
      <primitive 
        object={gltf.scene} 
        scale={scale} 
        position={position} 
      />
    </group>
  );
}

useGLTF.preload('/models/lyra_character.glb');