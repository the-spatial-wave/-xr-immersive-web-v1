// Scene 1 - This is the Game Changer
// V2.3.2 - Fixed Torus Rotation

import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
} from '@react-three/drei'
import { XR } from '@react-three/xr'
import type { XRStore } from '@react-three/xr'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'

import LyraCharacter from '../lyra/LyraCharacter'
import { useAppStore } from '../../store/appStore'

interface Scene1Props {
  xrStore: XRStore
  vrEnabled?: boolean
}

/* ============================================
   LIGHTING
   ============================================ */
function Scene1Lighting() {
  return (
    <>
      <directionalLight
        position={[4, 7, 4]}
        intensity={0.8}
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
      <directionalLight position={[-4, 4, -4]} intensity={0.3} color="#b4d4ff" />
      <pointLight
        position={[0, 6, -6]}
        intensity={0.5}
        color="#c4b5fd"
        distance={20}
        decay={2}
      />
      <ambientLight intensity={0.3} color="#ffffff" />
    </>
  )
}

/* ============================================
   GROUND - CYLINDRICAL PLATFORM WITH EDGE
   ============================================ */
function Scene1Ground() {
  const platformHeight = 0.5
  const platformRadius = 6
  const platformThickness = 0.15

  return (
    <group>
      {/* Main Platform (Cylinder) */}
      <mesh position={[0, platformHeight, 0]} receiveShadow castShadow>
        <cylinderGeometry
          args={[platformRadius, platformRadius, platformThickness, 64]}
        />
        <meshStandardMaterial
          color="#2d1b69"
          roughness={0.7}
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Platform Edge - Rotated correctly to lie flat */}
      <mesh 
        position={[0, platformHeight + (platformThickness / 2), 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[platformRadius, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#00d9ff"
          roughness={0.5}
          metalness={0.4}
          emissive="#00d9ff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0a0e1a"
          roughness={0.95}
          metalness={0.0}
          envMapIntensity={0.1}
        />
      </mesh>
    </group>
  )
}

/* ============================================
   DEBUG
   ============================================ */
function SceneDebug({ vrEnabled }: { vrEnabled: boolean }) {
  useEffect(() => {
    console.log(
      `📍 SCENE 1 V2.3.2 LOADED (VR: ${vrEnabled ? 'ENABLED ✅' : 'DISABLED 🚫'})`
    )
  }, [vrEnabled])

  return null
}

/* ============================================
   AMBIENT AUDIO
   ============================================ */
function useScene1AmbientAudio(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const audio = new Audio('/audio/scene1-ambient.mp3')
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.35
    audioRef.current = audio

    const tryPlay = async () => {
      if (!audioRef.current) return
      if (startedRef.current) return

      try {
        await audioRef.current.play()
        startedRef.current = true
        console.log('🎵 Scene1 ambient started')
      } catch {
        console.log('🔇 Autoplay blocked — will start on first user interaction')
      }
    }

    void tryPlay()

    const resume = () => {
      void tryPlay()
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('touchstart', resume)
      window.removeEventListener('click', resume)
      window.removeEventListener('keydown', resume)
    }

    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('touchstart', resume, { once: true })
    window.addEventListener('click', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })

    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('touchstart', resume)
      window.removeEventListener('click', resume)
      window.removeEventListener('keydown', resume)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      startedRef.current = false
      console.log('🛑 Scene1 ambient stopped')
    }
  }, [enabled])
}

/**
 * Scene1Content
 */
function Scene1Content({
  platformHeight,
  lyraHeightOffset,
}: {
  platformHeight: number
  lyraHeightOffset: number
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.65, 4.2]} fov={48} />
      <Scene1Lighting />

      {/* Subtle fog */}
      <fog attach="fog" args={['#0a0e1a', 6, 16]} />

      <Suspense fallback={null}>
        <group position={[0, platformHeight + lyraHeightOffset, 0]}>
          <LyraCharacter floating={true} bodyLookAt={true} />
        </group>
      </Suspense>

      <Scene1Ground />

      <ContactShadows
        position={[0, 0.505, 0]}
        opacity={0.5}
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
  )
}

export default function Scene1(props: Scene1Props) {
  const mode = useAppStore((s) => s.mode)

  const platformHeight = 0.5
  const lyraHeightOffset = 0.22
  const vrEnabled = props.vrEnabled ?? false

  useScene1AmbientAudio(mode === 'explore' || mode === 'xr')

  useEffect(() => {
    if (!vrEnabled && mode === 'xr') {
      console.warn('⚠️ Scene1: VR entry blocked - Feature disabled')
      useAppStore.getState().setMode('explore')
    }
  }, [mode, vrEnabled])

  useEffect(() => {
    if (vrEnabled && mode === 'xr') {
      console.log('🥽 Scene1: Auto-entering VR mode...')

      props.xrStore.enterVR().catch(() => {
        console.error('❌ Scene1: VR entry failed')
        alert('VR not available. Make sure you have a VR headset connected.')
        useAppStore.getState().setMode('explore')
      })
    }
  }, [mode, vrEnabled, props.xrStore])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #0f1419 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #0d1b2a 80%, #000000 100%)',
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.85,
        }}
      >
        <SceneDebug vrEnabled={vrEnabled} />

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
  )
}