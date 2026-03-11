// Scene 1 - This is the Game Changer
// V2.3.3 - Added signature

import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  useGLTF,
  Html,
  Text,
} from '@react-three/drei'
import { XR } from '@react-three/xr'
import type { XRStore } from '@react-three/xr'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

import LyraCharacter from '../lyra/LyraCharacter'
import { useAppStore } from '../../store/appStore'

// Preload Scene 2 model for better mobile performance
useGLTF.preload('/models/lyra_2scena.glb')

interface Scene1Props {
  xrStore: XRStore
  vrEnabled?: boolean
  onNavigate?: (sceneNumber: number) => void
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
      `📍 SCENE 1 V2.3.3 LOADED (VR: ${vrEnabled ? 'ENABLED ✅' : 'DISABLED 🚫'})`
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

/* ============================================
   CONTEXTUAL PANEL
   ============================================ */
function ContextPanel({ onNavigate }: { onNavigate?: (sceneNumber: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Html
      position={[2.5, 2, -1]}
      transform
      distanceFactor={3}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease-in',
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <div style={{
        background: 'rgba(8, 12, 20, 0.90)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 229, 255, 0.55)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '320px',
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(0, 217, 255, 0.15)'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#00d9ff',
          marginBottom: '16px',
          letterSpacing: '0.5px',
          lineHeight: '1.3'
        }}>
          QUESTA E UNA SCENA XR REALE
        </div>

        {/* Body */}
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '16px'
        }}>
          Gira nel browser.<br/>
          Nessuna app. Nessun visore.<br/><br/>
          E il punto di partenza del percorso XR Reset:<br/>
          uno spazio essenziale da comprendere,<br/>
          modificare e pubblicare.
        </div>

        {/* Lista */}
        <div style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '16px',
          lineHeight: '1.8'
        }}>
          <div>&#10022; Luce</div>
          <div>&#10022; Materia</div>
          <div>&#10022; Atmosfera</div>
        </div>

        {/* Footer */}
        <div style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '16px',
          fontStyle: 'italic'
        }}>
          Scena base del percorso XR Reset
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onNavigate?.(2)}
          style={{
            background: '#00E5FF',
            border: 'none',
            color: '#0B0F14',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%',
            letterSpacing: '0.5px'
          }}
        >
          SCOPRI IL PERCORSO →
        </button>
      </div>
    </Html>
  )
}

/* ============================================
   FLOOR TEXT
   ============================================ */
function FloorText() {
  return (
    <Text
      position={[0, 0.52, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.3}
      color="#00d9ff"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.1}
    >
      YOUR SPACE
      <meshBasicMaterial transparent opacity={0.15} color="#00d9ff" />
    </Text>
  )
}

/* ============================================
   MOBILE HUD - Fixed 2D overlay
   ============================================ */
function MobileHUD({ onNavigate }: { onNavigate?: (sceneNumber: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '16px',
      right: '16px',
      background: 'rgba(11, 15, 20, 0.85)',
      border: '1px solid rgba(0, 229, 255, 0.22)',
      borderRadius: '14px',
      padding: '14px 18px',
      backdropFilter: 'blur(18px)',
      zIndex: 50,
      fontFamily: 'Manrope, sans-serif',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.8s ease',
      pointerEvents: visible ? 'auto' : 'none'
    }}>
      {/* Tag */}
      <div style={{
        fontSize: '9px',
        color: '#00d9ff',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '8px',
        fontWeight: '600'
      }}>
        SCENA XR REALE
      </div>

      {/* Title */}
      <div style={{
        fontSize: '13px',
        fontWeight: '700',
        color: '#E8ECF0',
        marginBottom: '12px',
        lineHeight: '1.4'
      }}>
        Questa scena gira nel browser.
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onNavigate?.(2)}
        style={{
          background: 'linear-gradient(135deg, #00d9ff, #ff2fd6)',
          border: 'none',
          color: '#0B0F14',
          padding: '10px 16px',
          borderRadius: '7px',
          fontSize: '11px',
          fontWeight: '800',
          cursor: 'pointer',
          width: '100%',
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}
      >
        SCOPRI IL PERCORSO →
      </button>
    </div>
  )
}

/**
 * Scene1Content
 */
function Scene1Content({
  platformHeight,
  lyraHeightOffset,
  onNavigate,
  isMobile,
}: {
  platformHeight: number
  lyraHeightOffset: number
  onNavigate?: (sceneNumber: number) => void
  isMobile: boolean
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

      {/* Floor Text */}
      <FloorText />

      {/* Contextual Panel - Desktop only */}
      {!isMobile && <ContextPanel onNavigate={onNavigate} />}

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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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
              onNavigate={props.onNavigate}
              isMobile={isMobile}
            />
          </XR>
        ) : (
          <Scene1Content
            platformHeight={platformHeight}
            lyraHeightOffset={lyraHeightOffset}
            onNavigate={props.onNavigate}
            isMobile={isMobile}
          />
        )}
      </Canvas>

      {/* Mobile HUD - Fixed 2D overlay */}
      {isMobile && <MobileHUD onNavigate={props.onNavigate} />}

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