// Scene 3 - XR Reset Quiz (LITE)
// V3.2.0 - 3-Act Delayed Activation Sequence on Results

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import { XR } from '@react-three/xr'
import type { XRStore } from '@react-three/xr'
import { useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/appStore'

// ============================================
// TYPES
// ============================================

interface Scene3Props {
  xrStore: XRStore
  vrEnabled?: boolean
  onNavigate?: (sceneNumber: number) => void
}

type ProfileType = 'navigator' | 'architect' | 'alchemist'

interface Question {
  id: string
  axis: string
  text: string
  answers: string[]
}

// ============================================
// QUIZ DATA — 5 DOMANDE
// ============================================

const QUESTIONS: Question[] = [
  {
    id: 'Q1',
    axis: 'Motivazione',
    text: 'Cosa ti ha portato qui, ora?',
    answers: [
      "Capire cosa sta succedendo nell'XR",
      'Creare qualcosa di mio',
      'Insegnare o trasmettere',
      'Sperimentare senza obiettivi chiari'
    ]
  },
  {
    id: 'Q2',
    axis: 'Approccio',
    text: 'Quando impari qualcosa di nuovo, cosa ti guida?',
    answers: [
      'Struttura chiara: step, roadmap, guide',
      'Prototipare subito, anche sbagliando',
      'Osservare esempi e adattarli',
      'Esplorare finché "scatta qualcosa"'
    ]
  },
  {
    id: 'Q3',
    axis: 'Tecnologia',
    text: 'Per te la tecnologia è soprattutto...',
    answers: [
      'Uno strumento per raggiungere uno scopo',
      'Un linguaggio creativo',
      'Un mezzo educativo',
      'Un territorio da esplorare'
    ]
  },
  {
    id: 'Q4',
    axis: 'Output',
    text: 'Tra questi risultati, quale ti attrae?',
    answers: [
      'Un progetto concreto, utile',
      "Un'identità creativa riconoscibile",
      "Un'esperienza che guida altre persone",
      'Un sistema aperto, in evoluzione'
    ]
  },
  {
    id: 'Q5',
    axis: 'Incertezza',
    text: "Come ti senti quando non c'è una direzione chiara?",
    answers: [
      'A disagio: ho bisogno di riferimenti',
      'Stimolata/o: è lì che creo',
      'Curiosa/o ma con cautela',
      'A mio agio: mi fido del processo'
    ]
  }
]

// ============================================
// PROFILING LOGIC
// ============================================

type AffinityMap = {
  [question: string]: {
    [answer: string]: { navigator: number; architect: number; alchemist: number }
  }
}

const AFFINITY_MAP: AffinityMap = {
  Q1: {
    A: { navigator: 2, architect: 1, alchemist: 0 },
    B: { navigator: 0, architect: 1, alchemist: 2 },
    C: { navigator: 1, architect: 2, alchemist: 1 },
    D: { navigator: 2, architect: 0, alchemist: 1 }
  },
  Q2: {
    A: { navigator: 0, architect: 2, alchemist: 0 },
    B: { navigator: 1, architect: 1, alchemist: 2 },
    C: { navigator: 1, architect: 2, alchemist: 1 },
    D: { navigator: 2, architect: 0, alchemist: 1 }
  },
  Q3: {
    A: { navigator: 0, architect: 2, alchemist: 1 },
    B: { navigator: 1, architect: 0, alchemist: 2 },
    C: { navigator: 1, architect: 2, alchemist: 0 },
    D: { navigator: 2, architect: 0, alchemist: 1 }
  },
  Q4: {
    A: { navigator: 0, architect: 2, alchemist: 1 },
    B: { navigator: 1, architect: 0, alchemist: 2 },
    C: { navigator: 1, architect: 2, alchemist: 1 },
    D: { navigator: 2, architect: 1, alchemist: 1 }
  },
  Q5: {
    A: { navigator: 0, architect: 2, alchemist: 0 },
    B: { navigator: 1, architect: 0, alchemist: 2 },
    C: { navigator: 1, architect: 1, alchemist: 1 },
    D: { navigator: 2, architect: 0, alchemist: 1 }
  }
}

function calculateProfile(answers: number[]): ProfileType {
  const scores = { navigator: 0, architect: 0, alchemist: 0 }

  answers.forEach((answerIndex, questionIndex) => {
    const questionKey = `Q${questionIndex + 1}`
    const answerKey = ['A', 'B', 'C', 'D'][answerIndex]
    const affinity = AFFINITY_MAP[questionKey]?.[answerKey]
    if (affinity) {
      scores.navigator += affinity.navigator
      scores.architect += affinity.architect
      scores.alchemist += affinity.alchemist
    }
  })

  const max = Math.max(scores.navigator, scores.architect, scores.alchemist)
  if (scores.navigator === max) return 'navigator'
  if (scores.architect === max) return 'architect'
  return 'alchemist'
}

// ============================================
// PROFILE DATA
// ============================================

const PROFILES = {
  navigator: {
    icon: '🌌',
    name: 'NAVIGATOR',
    tagline: 'Esplori dove altri non guardano',
    description:
      "Il tuo ingresso nell'XR passa dall'esplorazione.\nNavighi territori nuovi senza mappa,\ntrovando connessioni che altri non vedono.",
    color: '#00d9ff',
    secondaryColor: 'rgba(0, 217, 255, 0.15)'
  },
  architect: {
    icon: '🔨',
    name: 'ARCHITECT',
    tagline: 'Trasformi complessità in struttura',
    description:
      'Costruisci valore attraverso sistemi e struttura.\nProgetti con chiarezza, esegui con precisione,\ntrasformi complessità in architettura.',
    color: '#a855f7',
    secondaryColor: 'rgba(168, 85, 247, 0.15)'
  },
  alchemist: {
    icon: '✨',
    name: 'ALCHEMIST',
    tagline: "L'XR è il tuo medium",
    description:
      "L'XR è il tuo medium, non il tuo obiettivo.\nTrasformi idee in esperienze,\nincertezza in linguaggio visivo.",
    color: '#ec4899',
    secondaryColor: 'rgba(236, 72, 153, 0.15)'
  }
}

// ============================================
// PARTICLE TYPE
// ============================================

interface Particle {
  id: number
  position: [number, number, number]
  size: number
  opacity: number
}

// ✅ FIX: generato a livello di modulo — fuori da qualsiasi componente.
// Math.random() viene chiamato una sola volta al caricamento del file,
// eliminando l'errore ESLint react-hooks/purity.
const PARTICLES: Particle[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  position: [
    (Math.random() - 0.5) * 12,
    Math.random() * 5 + 0.5,
    (Math.random() - 0.5) * 8 - 2
  ] as [number, number, number],
  size: 0.02 + Math.random() * 0.03,
  opacity: 0.3 + Math.random() * 0.4
}))

// ============================================
// 3D ENVIRONMENT
// ============================================

function QuizEnvironment() {
  const particles = PARTICLES

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 2.5, 7]} fov={48} />

      {/* Lights */}
      <ambientLight intensity={0.3} color="#1a1a2e" />
      <directionalLight
        position={[3, 8, 4]}
        intensity={0.6}
        color="#00d9ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-4, 3, 2]} intensity={0.4} color="#9c27b0" distance={10} />
      <pointLight position={[4, 3, 2]} intensity={0.4} color="#00d9ff" distance={10} />

      {/* Fog */}
      <fog attach="fog" args={['#05050f', 10, 22]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#07070f" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Platform */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 3.5, 0.04, 64]} />
        <meshStandardMaterial
          color="#0d0d1a"
          roughness={0.5}
          metalness={0.3}
          emissive="#00d9ff"
          emissiveIntensity={0.03}
        />
      </mesh>

      {/* Floating particles — posizioni fisse */}
      {particles.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial
            color={p.id % 2 === 0 ? '#00d9ff' : '#9c27b0'}
            transparent
            opacity={p.opacity}
          />
        </mesh>
      ))}

      {/* Contact shadows */}
      <ContactShadows
        position={[0, 0.03, 0]}
        opacity={0.3}
        scale={15}
        blur={2.5}
        far={4}
        frames={1}
      />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1.5, 0]}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.3}
      />
    </>
  )
}

// ============================================
// PROGRESS ORBS COMPONENT (HTML)
// ============================================

function ProgressOrbs({ current, total }: { current: number; total: number }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? '10px' : '8px',
            height: i === current ? '10px' : '8px',
            borderRadius: '50%',
            background:
              i < current
                ? '#00d9ff'
                : i === current
                ? '#00d9ff'
                : 'rgba(255,255,255,0.15)',
            border: i === current ? '2px solid rgba(0,217,255,0.6)' : 'none',
            boxShadow: i <= current ? '0 0 8px rgba(0,217,255,0.6)' : 'none',
            transition: 'all 0.4s ease'
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// QUIZ OVERLAY COMPONENT (HTML DOM)
// ============================================

interface QuizOverlayProps {
  currentQuestion: number
  questions: Question[]
  selectedAnswer: number | null
  onAnswer: (index: number) => void
  visible: boolean
}

function QuizOverlay({
  currentQuestion,
  questions,
  selectedAnswer,
  onAnswer,
  visible
}: QuizOverlayProps) {
  const question = questions[currentQuestion]
  const answerLabels = ['A', 'B', 'C', 'D']

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        pointerEvents: 'none',
        zIndex: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Progress */}
      <div style={{ marginBottom: '16px', pointerEvents: 'none' }}>
        <ProgressOrbs current={currentQuestion} total={5} />
        <div
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(0,217,255,0.6)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'monospace'
          }}
        >
          {question.axis} — {currentQuestion + 1} / 5
        </div>
      </div>

      {/* Question Card */}
      <div
        style={{
          background: 'rgba(5, 5, 16, 0.92)',
          border: '1px solid rgba(0,217,255,0.35)',
          borderRadius: '16px',
          padding: '28px 32px',
          maxWidth: '560px',
          width: '100%',
          marginBottom: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(0,217,255,0.12), 0 20px 60px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '12px',
            fontFamily: 'monospace'
          }}
        >
          LYRA — XR RESET
        </div>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.4,
            letterSpacing: '-0.01em'
          }}
        >
          {question.text}
        </div>
      </div>

      {/* Answer Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          maxWidth: '560px',
          width: '100%',
          pointerEvents: selectedAnswer !== null ? 'none' : 'auto'
        }}
      >
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswer === index

          return (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              style={{
                background: isSelected
                  ? 'rgba(156, 39, 176, 0.3)'
                  : 'rgba(10, 10, 25, 0.85)',
                border: isSelected
                  ? '1px solid rgba(156,39,176,0.7)'
                  : '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '16px',
                cursor: isSelected ? 'default' : 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.25s ease',
                boxShadow: isSelected ? '0 0 20px rgba(156,39,176,0.3)' : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (selectedAnswer === null) {
                  const el = e.currentTarget
                  el.style.border = '1px solid rgba(0,217,255,0.5)'
                  el.style.background = 'rgba(0,217,255,0.08)'
                  el.style.boxShadow = '0 0 15px rgba(0,217,255,0.15)'
                  el.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAnswer === null) {
                  const el = e.currentTarget
                  el.style.border = '1px solid rgba(255,255,255,0.12)'
                  el.style.background = 'rgba(10,10,25,0.85)'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'scale(1)'
                }
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isSelected ? 'rgba(200,100,255,0.9)' : 'rgba(0,217,255,0.6)',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                  fontFamily: 'monospace'
                }}
              >
                {answerLabels[index]}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                  lineHeight: 1.45,
                  fontWeight: 400
                }}
              >
                {answer}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer hint */}
      {selectedAnswer === null && (
        <div
          style={{
            marginTop: '14px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '1px',
            pointerEvents: 'none'
          }}
        >
          Seleziona una risposta per continuare
        </div>
      )}
    </div>
  )
}

// ============================================
// RESULTS OVERLAY
// ============================================

interface ResultsOverlayProps {
  profile: ProfileType
  onRestart: () => void
  onNavigate: (scene: number) => void
}

function ResultsOverlay({ profile, onRestart, onNavigate }: ResultsOverlayProps) {
  const data = PROFILES[profile]
  
  // 🎬 3-ACT SEQUENCE STATE
  const [showScanLine, setShowScanLine] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [showSecondaryButtons, setShowSecondaryButtons] = useState(false)

  useEffect(() => {
    // Atto 1: 0-2s → Solo lettura (bottoni invisibili)
    
    // Atto 2: 2s → Scan line activation
    const scanTimer = setTimeout(() => {
      setShowScanLine(true)
    }, 2000)
    
    // Atto 3: 3s → Primary button appears
    const primaryTimer = setTimeout(() => {
      setShowButtons(true)
    }, 3000)
    
    // Atto 3b: 3.2s → Secondary buttons appear
    const secondaryTimer = setTimeout(() => {
      setShowSecondaryButtons(true)
    }, 3200)
    
    return () => {
      clearTimeout(scanTimer)
      clearTimeout(primaryTimer)
      clearTimeout(secondaryTimer)
    }
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 10,
        animation: 'fadeIn 0.6s ease'
      }}
    >
      <div
        style={{
          background: 'rgba(5, 5, 16, 0.95)',
          border: `1px solid ${data.color}40`,
          borderRadius: '20px',
          padding: '36px',
          maxWidth: '500px',
          width: '100%',
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 60px ${data.color}20, 0 20px 60px rgba(0,0,0,0.6)`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* 🎬 ATTO 2: Scan Line Animation */}
        {showScanLine && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${data.color}, transparent)`,
              boxShadow: `0 0 20px ${data.color}`,
              animation: 'scanLine 0.8s ease-out forwards'
            }}
          />
        )}
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{data.icon}</div>

        <div
          style={{
            fontSize: '13px',
            letterSpacing: '4px',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '8px',
            fontFamily: 'monospace'
          }}
        >
          IL TUO PROFILO XR
        </div>

        <div
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: data.color,
            letterSpacing: '0.05em',
            marginBottom: '8px',
            textShadow: `0 0 30px ${data.color}60`
          }}
        >
          {data.name}
        </div>

        <div
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}
        >
          {data.tagline}
        </div>

        <div
          style={{
            width: '60px',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${data.color}60, transparent)`,
            margin: '0 auto 20px'
          }}
        />

        <div
          style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            marginBottom: '28px',
            whiteSpace: 'pre-line'
          }}
        >
          {data.description}
        </div>

        {/* 🎬 ATTO 3: Buttons with sequential appearance */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          {/* Primary CTA - appears first with pulse */}
          <button
            onClick={() => onNavigate(4)}
            style={{
              background: `linear-gradient(135deg, ${data.color}30, ${data.color}15)`,
              border: `1px solid ${data.color}50`,
              borderRadius: '10px',
              padding: '14px 24px',
              color: data.color,
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? 'translateY(0)' : 'translateY(10px)',
              animation: showButtons ? 'gentlePulse 2s ease-in-out 3' : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${data.color}25`
              e.currentTarget.style.boxShadow = `0 0 20px ${data.color}30`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${data.color}30, ${data.color}15)`
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            SCOPRI IL TUO PERCORSO →
          </button>

          {/* Secondary buttons - appear 200ms later */}
          <button
            onClick={onRestart}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '12px 24px',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.5px',
              opacity: showSecondaryButtons ? 1 : 0,
              transform: showSecondaryButtons ? 'translateY(0)' : 'translateY(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            }}
          >
            Rifai il quiz
          </button>

          <button
            onClick={() => onNavigate(2)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '6px',
              letterSpacing: '0.5px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: showSecondaryButtons ? 1 : 0,
              transform: showSecondaryButtons ? 'translateY(0)' : 'translateY(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
            }}
          >
            ← Torna alla Gallery
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN SCENE 3 COMPONENT
// ============================================

export default function Scene3(props: Scene3Props) {
  const { onNavigate } = props
  const mode = useAppStore((s) => s.mode)
  const vrEnabled = props.vrEnabled ?? false

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [quizComplete, setQuizComplete] = useState(false)
  const [profile, setProfile] = useState<ProfileType | null>(null)

  // VR Guards
  useEffect(() => {
    if (!vrEnabled && mode === 'xr') {
      console.warn('⚠️ Scene3: VR entry blocked')
      useAppStore.getState().setMode('explore')
    }
  }, [mode, vrEnabled])

  useEffect(() => {
    if (vrEnabled && mode === 'xr') {
      props.xrStore.enterVR().catch((err) => {
        console.error('❌ Scene3: VR entry failed:', err)
        useAppStore.getState().setMode('explore')
      })
    }
  }, [mode, vrEnabled, props.xrStore])

  useEffect(() => {
    console.log('📍 SCENE 3 LOADED — XR Reset Quiz')
  }, [])

  // Answer Handler
  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (selectedAnswer !== null) return

      setSelectedAnswer(answerIndex)
      const newAnswers = [...userAnswers, answerIndex]

      setTimeout(() => {
        if (currentQuestion < 4) {
          setOverlayVisible(false)
          setTimeout(() => {
            setCurrentQuestion((prev) => prev + 1)
            setSelectedAnswer(null)
            setUserAnswers(newAnswers)
            setOverlayVisible(true)
          }, 400)
        } else {
          const result = calculateProfile(newAnswers)
          setProfile(result)
          setUserAnswers(newAnswers)
          setOverlayVisible(false)
          setTimeout(() => {
            setQuizComplete(true)
            setOverlayVisible(true)
          }, 500)
          console.log(`🎯 Quiz complete! Profile: ${result}`, {
            answers: newAnswers,
            profile: result
          })
        }
      }, 350)
    },
    [selectedAnswer, currentQuestion, userAnswers]
  )

  // Restart Handler
  const handleRestart = useCallback(() => {
    setOverlayVisible(false)
    setTimeout(() => {
      setCurrentQuestion(0)
      setUserAnswers([])
      setSelectedAnswer(null)
      setProfile(null)
      setQuizComplete(false)
      setOverlayVisible(true)
    }, 400)
  }, [])

  // Navigate Handler
  const handleNavigate = useCallback(
    (sceneNumber: number) => {
      if (onNavigate) {
        onNavigate(sceneNumber)
      } else {
        if (sceneNumber === 4) {
          alert('🚧 Camera di Orientamento — Coming Soon!\n\nScene 4 sarà implementata prossimamente.')
        }
      }
    },
    [onNavigate]
  )

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: 'linear-gradient(180deg, #05050f 0%, #0a0a1e 60%, #07071a 100%)',
        overflow: 'hidden'
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes scanLine {
          0% { 
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            top: 100%;
            opacity: 0;
          }
        }
        @keyframes gentlePulse {
          0%, 100% { 
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(255,255,255,0);
          }
          50% { 
            transform: translateY(0) scale(1.02);
            box-shadow: 0 0 15px rgba(255,255,255,0.2);
          }
        }
      `}</style>

      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {vrEnabled ? (
          <XR store={props.xrStore}>
            <QuizEnvironment />
          </XR>
        ) : (
          <QuizEnvironment />
        )}
      </Canvas>

      {/* Quiz / Results Overlay */}
      {!quizComplete ? (
        <QuizOverlay
          currentQuestion={currentQuestion}
          questions={QUESTIONS}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          visible={overlayVisible}
        />
      ) : (
        profile && (
          <div
            style={{
              opacity: overlayVisible ? 1 : 0,
              transition: 'opacity 0.4s ease'
            }}
          >
            <ResultsOverlay
              profile={profile}
              onRestart={handleRestart}
              onNavigate={handleNavigate}
            />
          </div>
        )
      )}

      {/* Back button */}
      <button
        onClick={() => handleNavigate(2)}
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
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
          zIndex: 20,
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
        }}
      >
        ← Gallery
      </button>

      {/* Scene label */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          color: 'rgba(0,217,255,0.3)',
          letterSpacing: '2px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 20
        }}
      >
        SCENE 3 — XR RESET QUIZ
      </div>

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