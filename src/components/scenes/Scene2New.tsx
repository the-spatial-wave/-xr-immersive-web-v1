// Scene 2 NEW - Redesign with Sequential Panel Animation
// Pannelli che si accendono in sequenza all'entrata

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, ContactShadows, Float, Html } from '@react-three/drei'
import type { XRStore } from '@react-three/xr'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import CustomHDREnvironment from '../CustomHDREnvironment'

// Props interface
interface Scene2NewProps {
  xrStore?: XRStore
  vrEnabled?: boolean
  onNavigate?: (scene: number) => void
}

// Skin roughness map for shadow fix
function createSkinRoughnessMap(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  const baseRoughness = 0.45
  const baseGray = Math.floor(baseRoughness * 255)

  ctx.fillStyle = `rgb(${baseGray}, ${baseGray}, ${baseGray})`
  ctx.fillRect(0, 0, 512, 512)

  const imageData = ctx.getImageData(0, 0, 512, 512)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const variation = (Math.random() - 0.5) * 0.1 * 255
    const value = Math.max(0, Math.min(255, baseGray + variation))
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }

  ctx.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

// Lyra Character with shadow fix
function Lyra2Character() {
  const gltf = useGLTF('/models/lyra_2scena.glb')
  const characterRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!characterRef.current) return

    characterRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name.toLowerCase()
        const materialName = child.material?.name?.toLowerCase() || ''

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
          child.castShadow = true
          child.receiveShadow = false

          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial

            if (material.normalMap) material.normalMap = null
            if (material.roughnessMap) material.roughnessMap = null

            const skinRoughnessMap = createSkinRoughnessMap()
            material.roughnessMap = skinRoughnessMap
            material.roughness = 1.0

            if (material.metalnessMap) material.metalnessMap = null
            material.metalness = 0.0
            if (material.aoMap) material.aoMap = null
            if (material.bumpMap) material.bumpMap = null
            if (material.displacementMap) material.displacementMap = null

            material.flatShading = false

            if (material.map) {
              material.map.colorSpace = THREE.SRGBColorSpace
              material.map.minFilter = THREE.LinearMipmapLinearFilter
              material.map.magFilter = THREE.LinearFilter
              material.map.anisotropy = 16
              material.map.generateMipmaps = true
              material.map.needsUpdate = true
            }

            if (child.geometry) {
              child.geometry.computeVertexNormals()
            }

            material.needsUpdate = true
          }
        } else {
          child.castShadow = true
          child.receiveShadow = true
        }
      }
    })
  }, [])

  return <primitive ref={characterRef} object={gltf.scene} />
}

useGLTF.preload('/models/lyra_2scena.glb')

// Animated Panel Component
interface AnimatedPanelProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  delay: number
  visible: boolean
  label: string
  sublabel: string
}

function AnimatedPanel({ position, rotation, color, delay: _delay, visible, label, sublabel }: AnimatedPanelProps) {
  if (!visible) return null

  const meshRef = useRef<THREE.Mesh>(null)
  const [targetOpacity, setTargetOpacity] = useState(0)
  const [targetGlow, setTargetGlow] = useState(0)
  const [currentOpacity, setCurrentOpacity] = useState(0)
  const [currentGlow, setCurrentGlow] = useState(0)

  useEffect(() => {
    if (visible) {
      setTargetOpacity(0.9)
      setTargetGlow(1.2)
    }
  }, [visible])

  useFrame(() => {
    setCurrentOpacity(prev => THREE.MathUtils.lerp(prev, targetOpacity, 0.05))
    setCurrentGlow(prev => THREE.MathUtils.lerp(prev, targetGlow, 0.05))
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Main panel */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.8, 2.4, 0.05]} />
        <meshStandardMaterial
          color="#050510"
          transparent
          opacity={currentOpacity}
        />
      </mesh>

      {/* Border glow - top */}
      <mesh position={[0, 1.2, 0.03]}>
        <boxGeometry args={[1.8, 0.01, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentGlow}
        />
      </mesh>

      {/* Border glow - bottom */}
      <mesh position={[0, -1.2, 0.03]}>
        <boxGeometry args={[1.8, 0.01, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentGlow}
        />
      </mesh>

      {/* Border glow - left */}
      <mesh position={[-0.9, 0, 0.03]}>
        <boxGeometry args={[0.01, 2.4, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentGlow}
        />
      </mesh>

      {/* Border glow - right */}
      <mesh position={[0.9, 0, 0.03]}>
        <boxGeometry args={[0.01, 2.4, 0.01]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={currentGlow}
        />
      </mesh>

      {/* Spot light */}
      <spotLight
        position={[0, 2, 1]}
        angle={0.3}
        penumbra={1}
        intensity={currentGlow * 0.5}
        color={color}
        target-position={position}
      />

      {/* Text */}
      <Html center position={[0, 0, 0.06]} transform distanceFactor={8} occlude>
        <div
          style={{
            color: 'white',
            fontSize: '11px',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: currentOpacity,
            transition: 'opacity 0.3s'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '4px', letterSpacing: '1px' }}>
            {label}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.7 }}>
            {sublabel}
          </div>
        </div>
      </Html>
    </group>
  )
}

// Quiz Panel Simple
function SimpleQuizPanel({ visible, onNavigate }: { visible: boolean; onNavigate?: (scene: number) => void }) {
  if (!visible) return null

  const [currentOpacity, setCurrentOpacity] = useState(0)
  const [targetOpacity, setTargetOpacity] = useState(0)

  useEffect(() => {
    if (visible) {
      setTargetOpacity(1)
    }
  }, [visible])

  useFrame(() => {
    setCurrentOpacity(prev => THREE.MathUtils.lerp(prev, targetOpacity, 0.05))
  })

  return (
    <group position={[-1.0, 1.1, 0.5]} scale={1.2}>
      {/* Main panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.8, 0.06]} />
        <meshStandardMaterial
          color="#050510"
          transparent
          opacity={currentOpacity * 0.9}
        />
      </mesh>

      {/* Border - top */}
      <mesh position={[0, 0.9, 0.04]}>
        <boxGeometry args={[1.4, 0.015, 0.01]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={currentOpacity * 1.5}
        />
      </mesh>

      {/* Border - bottom */}
      <mesh position={[0, -0.9, 0.04]}>
        <boxGeometry args={[1.4, 0.015, 0.01]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={currentOpacity * 1.5}
        />
      </mesh>

      {/* Border - left */}
      <mesh position={[-0.7, 0, 0.04]}>
        <boxGeometry args={[0.015, 1.8, 0.01]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={currentOpacity * 1.5}
        />
      </mesh>

      {/* Border - right */}
      <mesh position={[0.7, 0, 0.04]}>
        <boxGeometry args={[0.015, 1.8, 0.01]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={currentOpacity * 1.5}
        />
      </mesh>

      {/* Content */}
      <Html center position={[0, 0, 0.07]} transform distanceFactor={8} occlude>
        <div
          style={{
            color: 'white',
            fontSize: '11px',
            textAlign: 'center',
            pointerEvents: visible ? 'auto' : 'none',
            userSelect: 'none',
            opacity: currentOpacity,
            width: '140px',
            padding: '16px'
          }}
        >
          <div style={{
            fontSize: '9px',
            color: 'rgba(0,217,255,0.7)',
            marginBottom: '8px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            XR Reset Quiz
          </div>
          <div style={{
            fontWeight: 600,
            marginBottom: '6px',
            fontSize: '13px',
            lineHeight: 1.3
          }}>
            Scopri il tuo profilo XR
          </div>
          <div style={{
            fontSize: '9px',
            opacity: 0.6,
            marginBottom: '12px'
          }}>
            5 domande · 2 minuti
          </div>
          <button
            onClick={() => onNavigate && onNavigate(3)}
            style={{
              background: '#00d9ff',
              color: '#000',
              fontWeight: 800,
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '10px',
              letterSpacing: '0.5px'
            }}
          >
            INIZIA IL QUIZ →
          </button>
        </div>
      </Html>
    </group>
  )
}

// Scene content
function SceneContent({ onNavigate }: { onNavigate?: (scene: number) => void }) {
  const [panel1Visible, setPanel1Visible] = useState(false)
  const [panel2Visible, setPanel2Visible] = useState(false)
  const [panel3Visible, setPanel3Visible] = useState(false)
  const [quizVisible, setQuizVisible] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setPanel1Visible(true), 1500))
    timers.push(setTimeout(() => setPanel2Visible(true), 3000))
    timers.push(setTimeout(() => setPanel3Visible(true), 4500))
    timers.push(setTimeout(() => setQuizVisible(true), 6000))
    timers.push(setTimeout(() => setHintVisible(true), 7000))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <>
      {/* HDR Environment */}
      <CustomHDREnvironment
        path="lyra-hub-night.hdr"
        background={true}
        intensity={0.4}
        offsetY={-0.2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.05} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[-2, 3, 1]}
        intensity={0.15}
        color="#b4d4ff"
      />

      {/* Platform */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5, 0.2, 64, 1]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>

      {/* Cyan ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[5.2, 0.025, 8, 128]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Lyra Character */}
      <Suspense fallback={null}>
        <Float speed={1} floatIntensity={0.3}>
          <group position={[1.2, 0.1, 0]} scale={2.8}>
            <Lyra2Character />
          </group>
        </Float>
      </Suspense>

      {/* Panel 1 - Left */}
      <AnimatedPanel
        position={[-3.2, 1.2, -1.5]}
        rotation={[0, 0.3, 0]}
        color="#00d9ff"
        delay={1500}
        visible={panel1Visible}
        label="WebXR"
        sublabel="Esperienze 3D nel browser"
      />

      {/* Panel 2 - Center */}
      <AnimatedPanel
        position={[0, 1.4, -2.8]}
        rotation={[0, 0, 0]}
        color="#8b5cf6"
        delay={3000}
        visible={panel2Visible}
        label="THE SPATIAL WAVE"
        sublabel="Tecnologia immersiva"
      />

      {/* Panel 3 - Right */}
      <AnimatedPanel
        position={[3.2, 1.2, -1.5]}
        rotation={[0, -0.3, 0]}
        color="#ec4899"
        delay={4500}
        visible={panel3Visible}
        label="Scopri il tuo"
        sublabel="Profilo XR →"
      />

      {/* Quiz Panel */}
      <SimpleQuizPanel visible={quizVisible} onNavigate={onNavigate} />

      {/* Hint text */}
      {hintVisible && (
        <Html position={[0, -0.3, 1]} center transform distanceFactor={8}>
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(0,217,255,0.6)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              animation: 'pulse 2s ease-in-out infinite',
              pointerEvents: 'none'
            }}
          >
            ↑ Fai il quiz
          </div>
        </Html>
      )}

      {/* Contact Shadows */}
      <ContactShadows
        position={[0, -0.09, 0]}
        resolution={512}
        frames={1}
        opacity={0.4}
        blur={2}
      />

      {/* Camera */}
      <perspectiveCamera
        position={[0, 1.8, 5]}
        fov={52}
      />
    </>
  )
}

// Main component
export default function Scene2New({ onNavigate }: Scene2NewProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          toneMappingExposure: 0.75
        }}
        camera={{ position: [0, 1.8, 5], fov: 52 }}
      >
        <SceneContent onNavigate={onNavigate} />
      </Canvas>

      {/* Navigation buttons */}
      <button
        onClick={() => onNavigate && onNavigate(1)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '13px',
          padding: '8px 14px',
          cursor: 'pointer',
          zIndex: 100
        }}
      >
        ← Home
      </button>

      {/* Signature */}
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
