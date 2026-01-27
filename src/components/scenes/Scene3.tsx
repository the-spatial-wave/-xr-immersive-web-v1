// Scene 3 - Showroom (Controllo) - Placeholder

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Scene3Content() {
  return (
    <group position={[0, 2, 0]}>
      {/* Sfera Cyan */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#00ffff" />
      </mesh>
      
      {/* Testo placeholder */}
      <mesh position={[0, 3, 0]}>
        <planeGeometry args={[4, 0.8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
}

export default function Scene3() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: 'linear-gradient(135deg, #0a1a2e 0%, #16213e 50%, #1f2b3e 100%)'
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
        <PerspectiveCamera 
          makeDefault 
          position={[0, 2, 6]}
          fov={48}
        />

        <directionalLight
          position={[4, 7, 4]}
          intensity={0.8}
          color="#00ffff"
          castShadow
        />
        <ambientLight intensity={0.3} />
        
        <fog attach="fog" args={['#0a1a2e', 5, 15]} />

        <Scene3Content />
        
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#0a1a2e" roughness={0.8} />
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
      </Canvas>
    </div>
  );
}