// Scene 2 - XR Reset (Cards) - Placeholder

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Scene2Content() {
  return (
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
  );
}

export default function Scene2() {
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

        <Scene2Content />
        
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
      </Canvas>
    </div>
  );
}