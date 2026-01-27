// Scene 2 - XR Reset (Cards) - Placeholder
// V2.1.0 - VR Feature Flag Architecture

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { XR } from '@react-three/xr';
import type { XRStore } from '@react-three/xr';
import { useEffect } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/appStore';

interface Scene2Props {
  xrStore: XRStore;
  vrEnabled?: boolean;
}

function Scene2Content() {
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 2, 6]}
        fov={48}
      />

      <directionalLight
        position={[4, 7, 4]}
        intensity={0.8}
        color="#ff00ff"
        castShadow
      />
      <ambientLight intensity={0.3} />
      
      <fog attach="fog" args={['#1a0a2e', 5, 15]} />

      <group position={[0, 2, 0]}>
        {/* Cubo Magenta */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ff00ff" />
        </mesh>
        
        {/* Testo placeholder */}
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[4, 0.8]} />
          <meshBasicMaterial color="#ff00ff" />
        </mesh>
      </group>
      
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.8} />
      </mesh>

      <OrbitControls
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        enablePan={false}
        target={[0, 2, 0]}
        enableDamping={true}
        dampingFactor={0.06}
      />
    </>
  );
}

export default function Scene2(props: Scene2Props) {
  const mode = useAppStore(s => s.mode);
  const vrEnabled = props.vrEnabled ?? false;
  
  // 🚧 VR Guard
  useEffect(() => {
    if (!vrEnabled && mode === 'xr') {
      console.warn('⚠️ Scene2: VR entry blocked');
      useAppStore.getState().setMode('explore');
    }
  }, [mode, vrEnabled]);
  
  // 🥽 VR Auto-enter (solo se enabled)
  useEffect(() => {
    if (vrEnabled && mode === 'xr') {
      console.log('🥽 Scene2: Auto-entering VR...');
      props.xrStore.enterVR().catch((err) => {
        console.error('❌ Scene2: VR entry failed:', err);
        alert('VR not available.');
        useAppStore.getState().setMode('explore');
      });
    }
  }, [mode, vrEnabled, props.xrStore]);
  
  useEffect(() => {
    console.log(`📍 SCENE 2 LOADED (VR: ${vrEnabled ? 'ENABLED ✅' : 'DISABLED 🚫'})`);
  }, [vrEnabled]);
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #3a1f5d 100%)'
    }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8
        }}
      >
        {/* Conditional XR Wrapper */}
        {vrEnabled ? (
          <XR store={props.xrStore}>
            <Scene2Content />
          </XR>
        ) : (
          <Scene2Content />
        )}
      </Canvas>
    </div>
  );
}