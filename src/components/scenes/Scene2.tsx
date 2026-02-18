// Scene 2 - Gallery - SHADOW FIX VERSION + QUIZ PANEL + SIGNATURE
// All shadow artifacts fixed: receiveShadow, bias, ContactShadows optimization
// Quiz Panel integrato per navigazione a Scene 3

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, ContactShadows, useGLTF } from '@react-three/drei'
import type { XRStore } from '@react-three/xr'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { QuizPanel } from '../UI/QuizPanel'

// ================================================
// PROPS INTERFACE
// ================================================
interface Scene2Props {
  xrStore?: XRStore
  vrEnabled?: boolean
  onNavigate?: (scene: number) => void
}

// ================================================
// SKIN ROUGHNESS MAP - Varied for WebXR
// Creates subtle variation to break grid artifacts
// ================================================
function createSkinRoughnessMap(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Base roughness (grayscale)
  const baseRoughness = 0.45 // Middle gray = 0.45 roughness
  const baseGray = Math.floor(baseRoughness * 255)
  
  ctx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`
  ctx.fillRect(0, 0, 512, 512)
  
  // Add subtle noise variation (breaks grid pattern!)
  const imageData = ctx.getImageData(0, 0, 512, 512)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    // Small random variation (±0.1 in roughness)
    const variation = (Math.random() - 0.5) * 0.1 * 255
    const value = Math.max(0, Math.min(255, baseGray + variation))
    data[i] = value     // R
    data[i + 1] = value // G
    data[i + 2] = value // B
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

// ================================================
// CONCRETE TEXTURE GENERATOR
// ================================================
function createConcreteTexture(type: 'dark' | 'medium' | 'light'): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  
  let baseColor: string
  let noiseIntensity: number
  
  switch(type) {
    case 'dark':
      baseColor = '#3a3a3d'
      noiseIntensity = 0.15
      break
    case 'medium':
      baseColor = '#6a6a6e'
      noiseIntensity = 0.2
      break
    case 'light':
      baseColor = '#9a9a9e'
      noiseIntensity = 0.25
      break
  }
  
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, 1024, 1024)
  
  const imageData = ctx.getImageData(0, 0, 1024, 1024)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * noiseIntensity * 255
    data[i] += noise
    data[i + 1] += noise
    data[i + 2] += noise
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  // Add subtle cracks
  if (type === 'light' || type === 'medium') {
    ctx.strokeStyle = `rgba(0, 0, 0, ${type === 'light' ? 0.1 : 0.06})`
    ctx.lineWidth = 2
    
    for (let i = 0; i < 12; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * 1024, Math.random() * 1024)
      ctx.lineTo(Math.random() * 1024, Math.random() * 1024)
      ctx.stroke()
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

// ================================================
// FLOOR - Dark concrete tiles
// ================================================
function Floor() {
  const texture = createConcreteTexture('dark')
  texture.repeat.set(8, 8)
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial 
        map={texture}
        color="#3a3a3d"
        roughness={0.85}
        metalness={0.0}
      />
    </mesh>
  )
}

// ================================================
// MAIN PLATFORM - Large light concrete platform
// ================================================
function MainPlatform() {
  const texture = createConcreteTexture('light')
  texture.repeat.set(3, 3)
  
  return (
    <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
      <boxGeometry args={[5, 0.3, 5]} />
      <meshStandardMaterial 
        map={texture}
        color="#9a9a9e"
        roughness={0.65}
        metalness={0.0}
      />
    </mesh>
  )
}

// ================================================
// BACK PLATFORM - Small platform with sphere
// ================================================
function BackPlatform() {
  const texture = createConcreteTexture('medium')
  texture.repeat.set(2, 2)
  
  return (
    <mesh position={[0, 0.5, -3]} castShadow receiveShadow>
      <boxGeometry args={[2.5, 0.25, 1.5]} />
      <meshStandardMaterial 
        map={texture}
        color="#7a7a7e"
        roughness={0.7}
        metalness={0.0}
      />
    </mesh>
  )
}

// ================================================
// LUMINOUS SPHERE - Warm glowing sphere
// ================================================
function LuminousSphere() {
  const sphereRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (sphereRef.current) {
      // Subtle pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * 0.6) * 0.05 + 0.95
      sphereRef.current.scale.setScalar(pulse)
    }
  })
  
  return (
    <group position={[0, 0.95, -3]}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color="#fffaf0"
          emissive="#ffd9a8"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* Point light from sphere - ridotta per non competere con panel */}
      <pointLight 
        position={[0, 0, 0]}
        intensity={10.2}
        distance={8}
        decay={2}
        color="#ffd9a8"
        castShadow
      />
    </group>
  )
}

// ================================================
// SPIRAL LAMP - Suspended spiral rings
// ================================================
function SpiralLamp() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  const rings = []
  const numRings = 3
  
  for (let i = 0; i < numRings; i++) {
    const y = 2.8 - i * 0.4
    const radius = 0.6 + i * 0.15
    const rotation = i * Math.PI * 0.3
    
    rings.push(
      <mesh 
        key={i} 
        position={[0, y, 0]} 
        rotation={[Math.PI / 2, 0, rotation]}
      >
        <torusGeometry args={[radius, 0.025, 16, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e8e8f0"
          emissiveIntensity={1.44}
          toneMapped={false}
        />
      </mesh>
    )
  }
  
  return (
    <group ref={groupRef} position={[-2.5, 0, -1]}>
      {rings}
      
      {/* Suspension points */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`point-${i}`} position={[0, 3.2 + i * 0.3, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
      ))}
      
      {/* Point lights for rings */}
      <pointLight position={[0, 2.8, 0]} intensity={3} distance={4} color="#e8e8f0" />
      <pointLight position={[0, 2.4, 0]} intensity={2} distance={3.5} color="#e8e8f0" />
    </group>
  )
}

// ================================================
// LYRA CHARACTER - Scene 2 with SHADOW FIX
// ================================================
function Lyra2Character() {
  const gltf = useGLTF('/models/lyra_2scena.glb')
  const characterRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    if (!characterRef.current) return
    
    console.log('✅ Lyra2 character loaded - Applying SHADOW FIX')
    
    // 🔥 FIX: Enable shadows BUT disable receiveShadow on SKIN
    characterRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Get mesh/material name (lowercase for easier matching)
        const meshName = child.name.toLowerCase()
        const materialName = child.material?.name?.toLowerCase() || ''
        
        // Check if this is a SKIN/BODY mesh (not clothing)
        const isSkin = 
          meshName.includes('body') ||
          meshName.includes('skin') ||
          meshName.includes('face') ||
          meshName.includes('head') ||
          meshName.includes('arm') ||
          meshName.includes('leg') ||
          meshName.includes('torso') ||
          meshName.includes('genesis') ||
          materialName.includes('skin') ||
          materialName.includes('body') ||
          materialName.includes('face')
        
        if (isSkin) {
          // 🔥 CRITICAL FIX: Skin does NOT receive shadows (prevents grid pattern)
          child.castShadow = true
          child.receiveShadow = false  // 👈 THIS IS THE KEY FIX!
          
          console.log(`🩹 SHADOW FIX applied to SKIN: ${child.name} (receiveShadow=false)`)
          
          // Apply material fixes
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial
            
            // Disable maps that cause artifacts
            if (material.normalMap) {
              material.normalMap = null
              console.log(`  → Normal map DISABLED`)
            }
            
            if (material.roughnessMap) {
              material.roughnessMap = null
              console.log(`  → Original roughness map DISABLED`)
            }
            
            // Apply VARIED roughness map (breaks grid!)
            const skinRoughnessMap = createSkinRoughnessMap()
            material.roughnessMap = skinRoughnessMap
            material.roughness = 1.0
            console.log(`  → Applied VARIED roughness map`)
            
            // Disable other maps
            if (material.metalnessMap) {
              material.metalnessMap = null
            }
            material.metalness = 0.0
            
            if (material.aoMap) {
              material.aoMap = null
            }
            
            if (material.bumpMap) {
              material.bumpMap = null
            }
            
            if (material.displacementMap) {
              material.displacementMap = null
            }
            
            material.flatShading = false
            
            // Fix base texture
            if (material.map) {
              material.map.colorSpace = THREE.SRGBColorSpace
              material.map.minFilter = THREE.LinearMipmapLinearFilter
              material.map.magFilter = THREE.LinearFilter
              material.map.anisotropy = 16
              material.map.generateMipmaps = true
              material.map.needsUpdate = true
            }
            
            // Smooth geometry
            if (child.geometry) {
              child.geometry.computeVertexNormals()
            }
            
            material.needsUpdate = true
          }
        } else {
          // 🔥 Clothing/accessories CAN receive shadows (normal behavior)
          child.castShadow = true
          child.receiveShadow = true
          
          console.log(`👗 Clothing/accessory: ${child.name} (receiveShadow=true)`)
        }
      }
    })
    
    console.log('✅ SHADOW FIX complete - Skin will NOT receive shadows')
  }, [])
  
  return <primitive ref={characterRef} object={gltf.scene} />
}

// Preload Lyra2 model
useGLTF.preload('/models/lyra_2scena.glb')

// ================================================
// PLANTER POT - Cylindrical concrete pot
// ================================================

// Pre-calculate stem rotations OUTSIDE component (static)
const STEM_ROTATIONS = [...Array(8)].map(() => Math.random() * 0.2 - 0.1)

function PlanterPot() {
  const texture = createConcreteTexture('dark')
  texture.repeat.set(2, 1)
  
  return (
    <group position={[-2.8, 0.3, -0.5]}>
      {/* Pot */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.35, 0.6, 32]} />
        <meshStandardMaterial 
          map={texture}
          color="#3a3a3d"
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>
      
      {/* Simple grass/plant representation */}
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.35, 0.8, 8, 1, true]} />
        <meshStandardMaterial 
          color="#4a5a4a"
          roughness={0.9}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Plant stems */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.15
        const z = Math.sin(angle) * 0.15
        
        return (
          <mesh key={i} position={[x, 0.5, z]} rotation={[0, 0, STEM_ROTATIONS[i]]}>
            <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
            <meshStandardMaterial color="#3a4a3a" />
          </mesh>
        )
      })}
    </group>
  )
}

// ================================================
// BACK WALL PANELS
// ================================================
function BackWalls() {
  const texture = createConcreteTexture('medium')
  texture.repeat.set(2, 4)
  
  const panels = [
    { x: -4, width: 2.5 },
    { x: -1, width: 2 },
    { x: 1.5, width: 2 },
    { x: 4, width: 2.5 },
  ]
  
  return (
    <group position={[0, 2.5, -5]}>
      {panels.map((panel, i) => (
        <mesh key={i} position={[panel.x, 0, 0]} receiveShadow>
          <boxGeometry args={[panel.width, 5, 0.3]} />
          <meshStandardMaterial 
            map={texture}
            color="#5a5a5e"
            roughness={0.75}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  )
}

// ================================================
// LIGHTING SETUP - SHADOW FIX VERSION
// ================================================
function GalleryLighting() {
  return (
    <>
      {/* Soft ambient */}
      <ambientLight intensity={0.6} color="#e8e8f0" />
      
      {/* 🔥 FIX: Main key light with PROPER shadow bias */}
      <directionalLight
        position={[3, 6, 4]}
        intensity={2.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={0.0005}          // 👈 Changed from -0.0001
        shadow-normalBias={0.03}      // 👈 ADDED (critical for curves)
      />
      
      {/* Fill light (softer, from side) */}
      <directionalLight
        position={[-4, 4, 2]}
        intensity={1.2}
        color="#d8dce8"
      />
      
      {/* Rim/back light */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={0.9}
        color="#c8d4e8"
      />
      
      {/* Subtle top light */}
      <pointLight
        position={[0, 5, -2]}
        intensity={4}
        distance={10}
        color="#f0f0f8"
      />
      
      {/* Additional front light for better visibility */}
      <directionalLight
        position={[5, 4, 8]}
        intensity={1.8}
        color="#ffffff"
      />
    </>
  )
}

// ================================================
// LOADING FALLBACK
// ================================================
function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#404040" 
        emissive="#404040" 
        emissiveIntensity={0.3}
        wireframe
      />
    </mesh>
  )
}

// ================================================
// MAIN SCENE 2 - SHADOW FIX VERSION + QUIZ PANEL + SIGNATURE
// ================================================
export default function Scene2(props: Scene2Props) {
  const vrEnabled = props.vrEnabled ?? false
  const { onNavigate } = props
  
  // Handler per Quiz Panel
  const handleStartQuiz = () => {
    console.log('🎮 Starting Quiz...')
    
    if (onNavigate) {
      onNavigate(3)  // Navigate to Scene 3
    } else {
      console.log('✅ Quiz Panel clicked! (Scene 3 not implemented yet)')
      alert('Quiz Panel clicked! Scene 3 sarà implementata prossimamente.')
    }
  }
  
  useEffect(() => {
    console.log(`📍 SCENE 2 GALLERY (SHADOW FIX + QUIZ PANEL)`)
    console.log(`   VR: ${vrEnabled ? 'ENABLED ✅' : 'DISABLED 🚫'}`)
    console.log(`   ✨ Shadow artifacts fix applied`)
    console.log(`   🎯 Quiz Panel integrated`)
  }, [vrEnabled])
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Scene Label */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 100,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'monospace',
        fontSize: '12px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        letterSpacing: '2px'
      }}>
        <div>LYRA HUB</div>
        <div style={{ marginTop: 5, fontSize: '10px', opacity: 0.6 }}>
          GALLERY — SCENE 2 (SHADOW FIX + QUIZ PANEL)
        </div>
      </div>
      
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          precision: 'highp',
        }}
        onCreated={({ gl }) => {
          // 🔥 FIX: Set shadow map type to PCFSoft for smoother shadows
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap  // 👈 CRITICAL FIX
          
          gl.capabilities.precision = 'highp'
          
          console.log('🎨 Renderer setup:')
          console.log('   Precision:', gl.capabilities.precision)
          console.log('   Shadow map type: PCFSoftShadowMap ✅')
        }}
        style={{ background: '#1a1a1c' }}
      >
        {/* Camera with micro-adjustment for panel focus */}
        <PerspectiveCamera 
          makeDefault 
          position={[5, 2.5, 7.1]} 
          fov={50}
        />
        
        {/* Lighting */}
        <GalleryLighting />
        
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#1a1a1c', 8, 22]} />
        
        {/* Scene Elements */}
        <Suspense fallback={<LoadingFallback />}>
          <Floor />
          <MainPlatform />
          <BackPlatform />
          <LuminousSphere />
          <SpiralLamp />
          <PlanterPot />
          <BackWalls />
          
          {/* Lyra2 Character - ruotato verso panel, posizione ottimizzata */}
          <group position={[1.6, 0.3, 0]} scale={3} rotation={[0, -0.12, 0]}>
            <Lyra2Character />
          </group>
          
          {/* 🎯 Quiz Panel - Micro Z tilt per effetto oggetto */}
          <group rotation={[0, Math.PI / 5, 0.04]}>
            <QuizPanel 
              position={[-0.5, 1.6, 1.05]}
              onStartQuiz={handleStartQuiz}
            />
          </group>
        </Suspense>
        
        {/* 🔥 Soft ContactShadows per effetto floating */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.34}              // Ridotta da 0.4 (-15%)
          scale={20}
          blur={3.2}                  // Aumentato da 2.5
          far={4}
          resolution={1024}
          frames={1}
          color="#000000"
        />
        
        {/* Camera Controls */}
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 1, -1]}
          enablePan={true}
        />
      </Canvas>

      {/* Firma */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
        textAlign: 'right',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.5,
        letterSpacing: '0.5px',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '2px' }}>Lyra Hub</div>
        <div style={{ fontSize: '10px', opacity: 0.85 }}>An experience by The Spatial Wave</div>
      </div>
    </div>
  )
}