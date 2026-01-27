// Scene 1 - This is the Game Changer
// V2.1.0 - VR Feature Flag Architecture

import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera,
  ContactShadows
} from '@react-three/drei';
import { XR } from '@react-three/xr';
import type { XRStore } from '@react-three/xr';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import LyraCharacter from '../lyra/LyraCharacter';
import CustomHDREnvironment from '../CustomHDREnvironment';
import { useAppStore } from '../../store/appStore';

interface Scene1Props {
  xrStore: XRStore;
  vrEnabled?: boolean;
}

function Scene1Lighting() {
  return (
    <>
      <directionalLight
        position={[4, 7, 4]}
        intensity={0.6}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-4, 4, -4]}
        intensity={0.15}
        color="#b4d4ff"
      />
      <pointLight
        position={[0, 6, -6]}
        intensity={0.3}
        color="#c4b5fd"
        distance={20}
        decay={2}
      />
      <ambientLight intensity={0.05} color="#ffffff" />
    </>
  );
}

function Scene1Ground() {
  const platformHeight = 0.5;
  const platformRadius = 6;
  const platformThickness = 0.15;
  
  return (
    <group>
      <mesh position={[0, platformHeight, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[platformRadius, platformRadius, platformThickness, 128, 1, false]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.95} metalness={0.0} envMapIntensity={0.0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0e1a" roughness={0.99} metalness={0.0} envMapIntensity={0.05} />
      </mesh>
    </group>
  );
}

function SceneDebug({ vrEnabled }: { vrEnabled: boolean }) {
  useEffect(() => {
    console.log(`📍 SCENE 1 V2.1.0 LOADED (VR: ${vrEnabled ? 'ENABLED ✅' : 'DISABLED 🚫'})`);
  }, [vrEnabled]);
  return null;
}

/**
 * Scene1Content - Contenuto riutilizzabile della scena
 * Può essere wrappato con <XR> o renderizzato direttamente
 */
function Scene1Content({ 
  platformHeight, 
  lyraHeightOffset 
}: { 
  platformHeight: number; 
  lyraHeightOffset: number;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.65, 4.2]} fov={48} />
      <Scene1Lighting />
      <CustomHDREnvironment 
        path="/textures/skybox/lyra-hub-night.hdr"
        background={true}
        blur={0.9}
        intensity={1.0}
        offsetY={-0.2}
      />
      <fog attach="fog" args={['#0a0e1a', 4, 12]} />
      <Suspense fallback={null}>
        <group position={[0, platformHeight + lyraHeightOffset, 0]}>
          <LyraCharacter floating={true} bodyLookAt={true} />
        </group>
      </Suspense>
      <Scene1Ground />
      <ContactShadows
        position={[0, 0.505, 0]}
        opacity={0.4}
        scale={10}
        blur={3.5}
        far={3}
        color="#000000"
      />
      <OrbitControls
        enableZoom={true}
        minDistance={2.5}
        maxDistance={8}
        enablePan={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1.4, 0]}
        enableDamping={true}
        dampingFactor={0.06}
      />
    </>
  );
}

export default function Scene1(props: Scene1Props) {
  const mode = useAppStore(s => s.mode);
  const platformHeight = 0.5;
  const lyraHeightOffset = 0.22;
  const vrEnabled = props.vrEnabled ?? false;
  
  // 🚧 VR GUARD - Blocca mode 'xr' quando VR disabled
  useEffect(() => {
    if (!vrEnabled && mode === 'xr') {
      console.warn('⚠️ Scene1: VR entry blocked - Feature disabled');
      // Ritorna a explore mode
      useAppStore.getState().setMode('explore');
    }
  }, [mode, vrEnabled]);
  
  // 🥽 VR AUTO-ENTER - Attivo solo quando VR enabled
  useEffect(() => {
    if (vrEnabled && mode === 'xr') {
      console.log('🥽 Scene1: Auto-entering VR mode...');
      
      props.xrStore.enterVR().catch((err) => {
        console.error('❌ Scene1: VR entry failed:', err);
        alert('VR not available. Make sure you have a VR headset connected.');
        // Fallback a explore mode in caso di errore
        useAppStore.getState().setMode('explore');
      });
    }
  }, [mode, vrEnabled, props.xrStore]);
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0d1b2a 100%)'
    }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.75
        }}
      >
        <SceneDebug vrEnabled={vrEnabled} />
        
        {/* 
          🔀 CONDITIONAL XR WRAPPER
          - Se VR enabled: Scene wrappata in <XR>
          - Se VR disabled: Scene renderizzata direttamente (no WebXR)
        */}
        {vrEnabled ? (
          <XR store={props.xrStore}>
            <Scene1Content 
              platformHeight={platformHeight} 
              lyraHeightOffset={lyraHeightOffset} 
            />
          </XR>
        ) : (
          <Scene1Content 
            platformHeight={platformHeight} 
            lyraHeightOffset={lyraHeightOffset} 
          />
        )}
      </Canvas>
    </div>
  );
}