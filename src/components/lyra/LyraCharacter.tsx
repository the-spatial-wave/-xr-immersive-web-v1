// LYRA Character Component
// V2.15 ENHANCED - Movimento PIÙ Evidente e Ampio

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface LyraCharacterProps {
  floating?: boolean;
  bodyLookAt?: boolean;
}

export default function LyraCharacter({ 
  floating = true,
  bodyLookAt = true 
}: LyraCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/lyra_character.glb');

  // LOG IMMEDIATO - Verifica caricamento
  useEffect(() => {
    console.log('🚀🚀🚀 V2.15 LYRA CHARACTER ENHANCED LOADED! 🚀🚀🚀');
    console.log('   floating:', floating);
    console.log('   bodyLookAt:', bodyLookAt);
    console.log('   ⚡ MOVIMENTO AMPLIFICATO: ~52° range, veloce!');
    console.log('-----------------------------------');
  }, [floating, bodyLookAt]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // FLOATING - Sempre attivo
    if (floating) {
      const floatOffset = Math.sin(time * 1.5) * 0.02;
      groupRef.current.position.y = floatOffset;
    }

    // BODY LOOK-AT - MOVIMENTO AMPLIFICATO
    if (bodyLookAt) {
      const camera = state.camera;
      
      // Direzione verso camera
      const lyraPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(lyraPos);
      
      const direction = new THREE.Vector3(
        camera.position.x - lyraPos.x,
        0,  // Solo orizzontale (no su/giù)
        camera.position.z - lyraPos.z
      );
      direction.normalize();

      // Angolo verso camera
      const targetAngle = Math.atan2(direction.x, direction.z);
      
      // ⚡ AMPLIFICATO: Rotazione MOLTO PIÙ ampia (~52°)
      const maxRotation = 0.9;  // ~52° (ERA 0.6 = ~34°)
      const clampedAngle = THREE.MathUtils.clamp(
        targetAngle,
        -maxRotation,
        maxRotation
      );

      // ⚡ AMPLIFICATO: Velocità MOLTO PIÙ alta (più reattivo)
      const currentRotation = groupRef.current.rotation.y;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        clampedAngle,
        0.15  // 15% per frame (ERA 0.1 = 10%)
      );
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/lyra_character.glb');