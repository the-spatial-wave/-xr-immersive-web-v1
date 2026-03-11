// Scene 2 - Gallery - SHADOW FIX VERSION + QUIZ PANEL + SIGNATURE
// All shadow artifacts fixed: receiveShadow, bias, ContactShadows optimization
// Quiz Panel integrato per navigazione a Scene 3

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, useGLTF, Float, Html } from '@react-three/drei'
import type { XRStore } from '@react-three/xr'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { QuizPanel } from '../UI/QuizPanel'
import { useAppStore } from '../../store/appStore'

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
    <mesh position={[0, -10, 0]} castShadow receiveShadow>
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
    <group ref={groupRef} position={[6, 0, -1]}>
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
  const characterRef = useRef<THREE.Object3D>(null)

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
    <group position={[-20, 0.3, -0.5]}>
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
// BACK WALL PANELS - LED SEQUENCE UPGRADE
// ================================================
function BackWalls() {
  const texture = createConcreteTexture('medium')
  texture.repeat.set(2, 4)

  // LED sequence visibility states
  const [panel1Visible, setPanel1Visible] = useState(false)
  const [panel2Visible, setPanel2Visible] = useState(false)
  const [panel3Visible, setPanel3Visible] = useState(false)
  const [panel4Visible, setPanel4Visible] = useState(false)

  // Sequential LED activation
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setPanel1Visible(true), 500))
    timers.push(setTimeout(() => setPanel2Visible(true), 2300))
    timers.push(setTimeout(() => setPanel3Visible(true), 4100))
    timers.push(setTimeout(() => setPanel4Visible(true), 5900))
    return () => timers.forEach(clearTimeout)
  }, [])

  const panels = [
    { x: -4, width: 2.5, color: '#00e5ff', label: 'WEB XR', subtitle: 'Esperienze 3D nel browser', visible: panel1Visible },
    { x: -1, width: 2, color: '#7a6cff', label: 'THE SPATIAL WAVE', subtitle: 'Studio XR · Community italiana', visible: panel2Visible },
    { x: 1.5, width: 2, color: '#2ef2c9', label: 'LYRA HUB', subtitle: 'Il tuo profilo XR in 5 domande', visible: panel3Visible },
    { x: 4, width: 2.5, color: '#ff2fd6', label: 'XR RESET', subtitle: 'Pubblica la tua scena in 4 ore', visible: panel4Visible },
  ]

  return (
    <group position={[0, 3.3, -5]}>
      {panels.map((panel, i) => (
        <LEDPanel
          key={i}
          position={[panel.x, 0, 0]}
          width={panel.width}
          color={panel.color}
          label={panel.label}
          subtitle={panel.subtitle}
          visible={panel.visible}
          texture={texture}
        />
      ))}
    </group>
  )
}

// Individual LED Panel with animation
function LEDPanel({ position, width, color, label, subtitle, visible, texture: _texture }: {
  position: [number, number, number]
  width: number
  color: string
  label: string
  subtitle: string
  visible: boolean
  texture: THREE.Texture
}) {
  const [currentIntensity, setCurrentIntensity] = useState(0)
  const targetIntensity = visible ? 1.2 : 0

  useFrame(() => {
    setCurrentIntensity(prev => THREE.MathUtils.lerp(prev, targetIntensity, 0.04))
  })

  const height = 5
  const depth = 0.3
  const frameThickness = 0.04
  const frameDepth = 0.05

  return (
    <group position={position} scale={[1.2, 1.2, 1]}>
      {/* Main panel - dark background */}
      <mesh receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#050508"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* LED Frame - Top */}
      <mesh position={[0, height / 2, depth / 2 + frameDepth / 2]}>
        <boxGeometry args={[width, frameThickness, frameDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentIntensity}
        />
      </mesh>

      {/* LED Frame - Bottom */}
      <mesh position={[0, -height / 2, depth / 2 + frameDepth / 2]}>
        <boxGeometry args={[width, frameThickness, frameDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentIntensity}
        />
      </mesh>

      {/* LED Frame - Left */}
      <mesh position={[-width / 2, 0, depth / 2 + frameDepth / 2]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentIntensity}
        />
      </mesh>

      {/* LED Frame - Right */}
      <mesh position={[width / 2, 0, depth / 2 + frameDepth / 2]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentIntensity}
        />
      </mesh>

      {/* Text Content */}
      <Html
        center
        position={[0, 0, depth / 2 + 0.1]}
        transform
        distanceFactor={2.5}
        occlude={false}
        zIndexRange={[1, 10]}
      >
        <div style={{
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s'
        }}>
          {/* Title - with special two-line handling for THE SPATIAL WAVE */}
          {label === 'THE SPATIAL WAVE' ? (
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: color,
              letterSpacing: '3px',
              marginBottom: '8px',
              opacity: 1.0,
              textShadow: `0 0 12px ${color}`
            }}>
              <div>THE SPATIAL</div>
              <div>WAVE</div>
            </div>
          ) : (
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: color,
              letterSpacing: '3px',
              marginBottom: '8px',
              opacity: 1.0,
              textShadow: `0 0 12px ${color}`
            }}>
              {label}
            </div>
          )}

          {/* Subtitle */}
          <div style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: '18px',
            color: '#ffffff',
            opacity: 0.9,
            letterSpacing: '0.5px',
            display: 'block',
            marginTop: '10px',
            lineHeight: '1.5',
            maxWidth: '180px',
            textAlign: 'center',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}>
            {subtitle}
          </div>
        </div>
      </Html>
    </group>
  )
}

// ================================================
// LIGHTING SETUP - SHADOW FIX VERSION
// ================================================
function GalleryLighting() {
  return (
    <>
      {/* Soft ambient - reduced for LED effect */}
      <ambientLight intensity={0.1} color="#e8e8f0" />
      
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
// CAMERA INTRO ANIMATION - Zoom from far to close
// ================================================
function CameraIntroAnimation({ onReady, isMobile }: { onReady: () => void; isMobile: boolean }) {
  const { camera } = useThree()
  const [cameraAnimating, setCameraAnimating] = useState(true)
  const hasStarted = useRef(false)

  // Set FOV on mount based on device type
  useEffect(() => {
    if ('fov' in camera) {
      camera.fov = isMobile ? 75 : 60
      camera.updateProjectionMatrix()
    }
  }, [camera, isMobile])

  // Animate camera with lerp
  useFrame(() => {
    // Signal canvas is ready on first frame
    if (!hasStarted.current) {
      hasStarted.current = true
      onReady()
      console.log(`📹 Camera intro animation started - zooming from [0, 8, 28] (${isMobile ? 'Mobile' : 'Desktop'})`)
    }

    if (cameraAnimating) {
      // Responsive target position: mobile needs more distance
      const target = new THREE.Vector3(0, 1.5, isMobile ? 10 : 7)

      // Lerp camera position
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, target.x, 0.045)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, target.y, 0.045)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, target.z, 0.045)

      // Always look at the center of the scene
      camera.lookAt(0, 1, 0)

      // Stop animation when close enough to target
      if (camera.position.distanceTo(target) < 0.1) {
        setCameraAnimating(false)
        const targetPos = isMobile ? '[0, 1.5, 10]' : '[0, 1.5, 7]'
        console.log(`📹 Camera intro animation complete - reached target ${targetPos}`)
      }
    }
  })

  return null
}

// ================================================
// MAIN SCENE 2 - SHADOW FIX VERSION + QUIZ PANEL + SIGNATURE
// ================================================
export default function Scene2(props: Scene2Props) {
  const vrEnabled = props.vrEnabled ?? false
  const { onNavigate } = props

  // Mobile detection for responsive camera and layout
  const isMobile = window.innerWidth < 768

  // Canvas ready state to prevent first-frame bug
  const [canvasReady, setCanvasReady] = useState(false)

  // Label and Quiz Panel visibility with delays
  const [labelVisible, setLabelVisible] = useState(false)
  const [quizVisible, setQuizVisible] = useState(false)

  // Audio state from store
  const voiceOverPlayed = useAppStore(s => s.voiceOverPlayed)
  const setVoiceOverPlayed = useAppStore(s => s.setVoiceOverPlayed)

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

    // Voice over after 1s (only if not already played)
    const voiceTimer = setTimeout(() => {
      if (!voiceOverPlayed) {
        try {
          const audio = new Audio('/audio/lyra-embrace.mp3')
          audio.loop = false
          audio.volume = 0.4
          audio.play().catch(err => {
            console.log('🔇 Voice over not available:', err.message)
          })
          // Mark as played
          setVoiceOverPlayed()
        } catch (err) {
          // Silently skip if file doesn't exist
        }
      }
    }, 1000)

    // Label appearance during camera dolly-in
    const labelTimer = setTimeout(() => {
      setLabelVisible(true)
      console.log('✨ "PROFILO XR" label now visible')
    }, 4500)

    // Quiz Panel delayed appearance (after camera stops + all panels lit)
    const quizTimer = setTimeout(() => {
      setQuizVisible(true)
      console.log('✨ Quiz Panel now visible')
    }, 13000)

    return () => {
      clearTimeout(voiceTimer)
      clearTimeout(labelTimer)
      clearTimeout(quizTimer)
    }
  }, [vrEnabled])
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Keyframe CSS for Quiz Button Animation */}
      <style>{`
        @keyframes quizGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0,229,255,0.4),
                        0 0 40px rgba(255,47,214,0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(0,229,255,0.8),
                        0 0 60px rgba(255,47,214,0.5),
                        0 0 80px rgba(0,229,255,0.2);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

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
      </div>

      {/* PROFILO XR Overlay - HTML2D (responsive) */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '12%' : '18%',
        left: isMobile ? '3%' : '4%',
        fontFamily: 'Orbitron, sans-serif',
        pointerEvents: 'none',
        opacity: labelVisible ? 1 : 0,
        transition: 'opacity 1.5s ease',
        zIndex: 10
      }}>
        <div style={{
          fontSize: isMobile ? '8px' : '11px',
          letterSpacing: isMobile ? '2px' : '4px',
          color: 'rgba(0,229,255,0.6)',
          marginBottom: isMobile ? '3px' : '6px'
        }}>SCOPRI IL TUO</div>
        <div style={{
          fontSize: isMobile ? '18px' : '28px',
          fontWeight: '700',
          letterSpacing: isMobile ? '3px' : '6px',
          color: '#00e5ff',
          textShadow: '0 0 30px rgba(0,229,255,0.5)'
        }}>PROFILO XR</div>
      </div>

      {/* Loading Screen */}
      {!canvasReady && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          gap: '20px'
        }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '11px',
            letterSpacing: '4px',
            color: 'rgba(0,229,255,0.6)',
            textTransform: 'uppercase'
          }}>
            LYRA HUB
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(0,229,255,0.15)',
            borderTop: '2px solid #00e5ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '9px',
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.2)'
          }}>
            INIZIALIZZAZIONE SCENA XR
          </div>
        </div>
      )}

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 8, 28], fov: 60 }}
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
        style={{
          background: '#1a1a1c',
          opacity: canvasReady ? 1 : 0,
          transition: 'opacity 0.4s ease'
        }}
      >
        {/* Camera Intro Animation */}
        <CameraIntroAnimation onReady={() => setCanvasReady(true)} isMobile={isMobile} />

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

          {/* Circular Platform - upgrade visual */}
          <mesh position={[0, 0.12, 0]} scale={[1, 1, 1]}>
            <cylinderGeometry args={[5.5, 5.5, 0.18, 64, 1]} />
            <meshStandardMaterial
              color="#0d0d1a"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>

          {/* Luminous Ring */}
          <mesh position={[0, 0.20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[4.5, 0.02, 8, 128]} />
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Lyra2 Character - repositioned LEFT side (responsive position) */}
          <group position={isMobile ? [-0.5, 0.2, 2.5] : [-1.8, 0.2, 2.5]} scale={2.6} rotation={[0, 0.2, 0]}>
            <Lyra2Character />
          </group>

          {/* Quiz Panel - with Float animation RIGHT side + delayed appearance (responsive Z) */}
          {quizVisible && (
            <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.25}>
              <group rotation={[0, -0.05, 0]}>
                <QuizPanel
                  position={isMobile ? [0.8, 1.2, 1.3] : [0.8, 1.2, 2.8]}
                  onStartQuiz={handleStartQuiz}
                />
              </group>
            </Float>
          )}
        </Suspense>

        {/* ContactShadows - platform specific */}
        <ContactShadows
          position={[0, 0.11, 0]}
          opacity={0.35}
          scale={20}
          blur={3.2}
          far={4}
          resolution={512}
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