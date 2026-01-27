// ============================================
// SCENE 3D - V1.3 FINAL - LYRA HUB PALETTE
// Background notte blu/viola + Luci ultra-dark
// ============================================

import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  ContactShadows
} from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import LyraCharacter from './lyra/LyraCharacter';

// ========== LIGHTING SETUP - ULTRA DARK ==========
function SceneLighting() {
  return (
    <>
      {/* Key Light */}
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

      {/* Fill Light - con hint blu LYRA */}
      <directionalLight
        position={[-4, 4, -4]}
        intensity={0.15}
        color="#b4d4ff"
      />

      {/* Rim Light - con hint viola LYRA */}
      <pointLight
        position={[0, 6, -6]}
        intensity={0.3}
        color="#c4b5fd"              // Viola più tenue
        distance={20}
        decay={2}
      />

      {/* Ambient Light - BASSISSIMA */}
      <ambientLight 
        intensity={0.05}
        color="#ffffff" 
      />
    </>
  );
}

// ========== GROUND PLANE - Blu scuro LYRA ==========
function GroundPlane() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#0f1420"              // Blu notte scuro
        roughness={0.99}
        metalness={0.0}
        envMapIntensity={0.1}
      />
    </mesh>
  );
}

// ========== MAIN SCENE ==========
export default function Scene3D() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      // PALETTE LYRA HUB - Blu/Viola/Cyan notte
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
        {/* ========== CAMERA ========== */}
        <PerspectiveCamera 
          makeDefault 
          position={[0, 1.65, 4.2]}
          fov={48}
        />

        {/* ========== LIGHTING ========== */}
        <SceneLighting />

        {/* ========== ENVIRONMENT - Forest scuro ========== */}
        <Environment 
          preset="forest"
          background={true}
          blur={0.95}
        />

        {/* ========== FOG - Blu notte LYRA ========== */}
        <fog attach="fog" args={['#0a0e1a', 4, 12]} />

        {/* ========== CHARACTER ========== */}
        <Suspense fallback={null}>
          <LyraCharacter floating={true} />
        </Suspense>

        {/* ========== GROUND ========== */}
        <GroundPlane />

        {/* ========== SHADOWS ========== */}
        <ContactShadows
          position={[0, 0.005, 0]}
          opacity={0.7}
          scale={8}
          blur={2.0}
          far={3}
          color="#000000"
        />

        {/* ========== CONTROLS ========== */}
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
      </Canvas>
    </div>
  );
}