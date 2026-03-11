// src/components/UI/QuizPanel.tsx
// Quiz Panel - Dimensioni ottimizzate + tutto il testo
import { Text, RoundedBox, Html } from '@react-three/drei'
import { useMemo, useEffect } from 'react'
import * as THREE from 'three'

interface QuizPanelProps {
  position: [number, number, number]
  onStartQuiz: () => void
}

// Starfield texture generator
function createStarfieldTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 512)
  gradient.addColorStop(0, '#050510')
  gradient.addColorStop(0.5, '#0a0a18')
  gradient.addColorStop(1, '#050510')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)
  
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = Math.random() * 1.5 + 0.5
    const brightness = Math.random() * 0.8 + 0.2
    
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
    
    if (Math.random() > 0.7) {
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
      glowGradient.addColorStop(0, `rgba(100, 200, 255, ${brightness * 0.3})`)
      glowGradient.addColorStop(1, 'rgba(100, 200, 255, 0)')
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(x, y, size * 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function QuizPanel({ position, onStartQuiz }: QuizPanelProps) {
  const starfieldTexture = useMemo(() => createStarfieldTexture(), [])

  // Inject pulse animation keyframes once
  useEffect(() => {
    const styleId = 'quiz-pulse-keyframes'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes pulseBtn {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0,229,255,0.4), 0 0 40px rgba(255,47,214,0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(0,229,255,0.7), 0 0 60px rgba(255,47,214,0.4);
          }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <group position={position}>
      {/* Background Panel - PIÙ STRETTO + PIÙ ALTO (quasi come LYRA) */}
      <RoundedBox args={[1.8, 1.6, 0.08]} radius={0.05} smoothness={4} castShadow receiveShadow={false}>
        <meshStandardMaterial
          map={starfieldTexture}
          color="#050510"
          transparent
          opacity={0.95}
          roughness={0.2}
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </RoundedBox>

      {/* Cyan Border Glow */}
      <RoundedBox 
        args={[1.88, 1.68, 0.03]} 
        radius={0.055} 
        smoothness={4}
        position={[0, 0, -0.027]}
      >
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={2.5}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </RoundedBox>

      {/* Outer Glow Layer */}
      <RoundedBox 
        args={[1.94, 1.74, 0.02]} 
        radius={0.06} 
        smoothness={4}
        position={[0, 0, -0.032]}
      >
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </RoundedBox>

      {/* Inner Glow Effect */}
      <RoundedBox 
        args={[1.76, 1.56, 0.02]} 
        radius={0.045} 
        smoothness={4}
        position={[0, 0, 0.041]}
      >
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={0.35}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </RoundedBox>

      {/* Brand Label "LYRA" */}
      <Text
        position={[0, 0.68, 0.045]}
        fontSize={0.065}
        color="rgba(255,255,255,0.7)"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        LYRA
      </Text>

      {/* Title "XR RESET" */}
      <Text
        position={[0, 0.48, 0.045]}
        fontSize={0.13}
        color="#00d9ff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.05}
      >
        XR RESET
      </Text>

      {/* Divider Line */}
      <mesh position={[0, 0.35, 0.043]}>
        <planeGeometry args={[1.4, 0.002]} />
        <meshBasicMaterial 
          color="#00d9ff" 
          transparent 
          opacity={0.4}
        />
      </mesh>

      {/* Subtitle */}
      <Text
        position={[0, 0.22, 0.045]}
        fontSize={0.06}
        color="rgba(255,255,255,0.95)"
        anchorX="center"
        anchorY="middle"
      >
        Quiz Interattivo
      </Text>

      {/* Description Line 1 */}
      <Text
        position={[0, 0.06, 0.045]}
        fontSize={0.048}
        color="rgba(255,255,255,0.85)"
        anchorX="center"
        anchorY="middle"
      >
        Scopri il tuo percorso XR
      </Text>

      {/* Description Line 2 */}
      <Text
        position={[0, -0.04, 0.045]}
        fontSize={0.048}
        color="rgba(255,255,255,0.85)"
        anchorX="center"
        anchorY="middle"
      >
        in 5 domande
      </Text>

      {/* CTA Button - HTML Button */}
      <Html
        position={[0, -0.28, 0.045]}
        center
        distanceFactor={1.5}
        transform
        style={{
          opacity: 1,
          transition: 'opacity 0.6s ease-in'
        }}
      >
        <style>{`
          @media (max-width: 480px) {
            .quiz-button-responsive {
              font-size: 13px !important;
              padding: 10px 16px !important;
              letter-spacing: 1px !important;
              white-space: nowrap !important;
            }
          }
          .quiz-button-responsive:hover,
          .quiz-button-responsive:active {
            animation: none !important;
          }
        `}</style>
        <button
          onClick={onStartQuiz}
          className="quiz-button-responsive"
          style={{
            background: 'linear-gradient(135deg, #00e5ff, #ff2fd6)',
            border: 'none',
            color: '#0a0a0f',
            padding: '14px 32px',
            borderRadius: '8px',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '13px',
            fontWeight: '800',
            letterSpacing: '2px',
            cursor: 'pointer',
            width: '100%',
            textTransform: 'uppercase',
            animation: 'pulseBtn 1.8s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(0,229,255,0.4), 0 0 40px rgba(255,47,214,0.2)'
          }}
        >
          SCOPRI IL TUO PROFILO XR
        </button>
      </Html>

      {/* Info Text "2 minuti" */}
      <Text
        position={[0, -0.66, 0.045]}
        fontSize={0.038}
        color="rgba(255,255,255,0.5)"
        anchorX="center"
        anchorY="middle"
      >
        2 minuti
      </Text>

      {/* Side lights for diffuse glow */}
      <pointLight
        position={[-1.0, 0, 0.4]}
        intensity={0.5}
        distance={2.5}
        color="#00d9ff"
        decay={2}
      />
      <pointLight
        position={[1.0, 0, 0.4]}
        intensity={0.5}
        distance={2.5}
        color="#00d9ff"
        decay={2}
      />
      
      {/* Subtle top/bottom lights */}
      <pointLight
        position={[0, 0.8, 0.3]}
        intensity={0.3}
        distance={2}
        color="#00d9ff"
      />
      <pointLight
        position={[0, -0.8, 0.3]}
        intensity={0.3}
        distance={2}
        color="#00d9ff"
      />
    </group>
  )
}