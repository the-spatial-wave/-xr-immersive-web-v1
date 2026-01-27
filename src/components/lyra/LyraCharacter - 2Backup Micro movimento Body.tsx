// LYRA Character Component
// V2.7 FULL BODY LOOK-AT - Ruota corpo intero (GARANTITO visibile!)

import { useRef } from 'react';
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
  
  // Parametri Full Body Look-At
  const lookAtSpeed = 0.05;        // Smooth rotation
  const maxRotationY = 0.35;       // ~20° (visibile ma naturale)
  const lookAtHeight = 1.6;        // Altezza punto target
  
  // Floating animation
  const floatAmplitude = 0.02;
  const floatSpeed = 1.5;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Floating animation (mantiene)
    if (floating) {
      const floatOffset = Math.sin(time * floatSpeed) * floatAmplitude;
      groupRef.current.position.y = floatOffset;
    }

    // Full Body Look-At
    if (bodyLookAt) {
      const camera = state.camera;
      
      // Posizione LYRA
      const lyraPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(lyraPos);
      
      // Target position (camera ma alla stessa altezza di LYRA)
      const targetPos = new THREE.Vector3(
        camera.position.x,
        lyraPos.y + lookAtHeight,
        camera.position.z
      );

      // Calcola direzione verso camera (solo orizzontale!)
      const direction = new THREE.Vector3();
      direction.subVectors(targetPos, lyraPos);
      direction.y = 0; // Ignora componente verticale
      direction.normalize();

      // Calcola angolo target
      const targetAngle = Math.atan2(direction.x, direction.z);
      
      // Clamp angolo (limita rotazione)
      const clampedAngle = THREE.MathUtils.clamp(
        targetAngle,
        -maxRotationY,
        maxRotationY
      );

      // Rotazione attuale
      const currentRotation = groupRef.current.rotation.y;
      
      // Smooth lerp verso target
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        currentRotation,
        clampedAngle,
        lookAtSpeed
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