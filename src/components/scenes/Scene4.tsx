// Scene 4 - Profile Results & CTA

import { useMemo } from 'react'

interface Scene4Props {
  profile: 'navigator' | 'architect' | 'alchemist'
  onRestart: () => void
  onBack: () => void
}

const profileData = {
  navigator: {
    label: 'NAVIGATOR',
    tagline: 'Esplori dove altri non guardano',
    color: '#00d9ff',
    message: "Il tuo ingresso nell'XR passa dalla mappa. XR Reset ti dà la struttura per muoverti senza perderti in documentazioni infinite.",
  },
  architect: {
    label: 'ARCHITECT',
    tagline: 'Costruisci mentre altri aspettano',
    color: '#8b5cf6',
    message: "Il tuo ingresso nell'XR passa dal codice. XR Reset ti dà il setup perfetto per costruire e pubblicare senza blocchi tecnici.",
  },
  alchemist: {
    label: 'ALCHEMIST',
    tagline: 'Trasformi visioni in esperienze',
    color: '#ec4899',
    message: "Il tuo ingresso nell'XR passa dalla creatività. XR Reset ti mostra come trasformare i tuoi asset visivi in esperienze 3D pubblicabili.",
  },
}

export default function Scene4({ profile, onRestart, onBack }: Scene4Props) {
  const data = profileData[profile]
  const isMobile = useMemo(() => window.innerWidth < 768, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0a0118 100%)',
        overflowY: 'auto',
      }}
    >
      {/* Pannello centrale */}
      <div
        style={{
          background: 'rgba(5,5,16,0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${data.color}4D`,
          borderRadius: '16px',
          padding: isMobile ? '24px' : '40px',
          paddingBottom: isMobile ? '36px' : '60px',
          maxWidth: '520px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          margin: isMobile ? '20px auto' : '0 auto',
        }}
      >
        {/* 1. Label */}
        <div
          style={{
            fontSize: isMobile ? '9px' : '10px',
            letterSpacing: isMobile ? '2px' : '3px',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: isMobile ? '6px' : '8px',
          }}
        >
          IL TUO PROFILO XR
        </div>

        {/* 2. Titolo profilo */}
        <div
          style={{
            fontSize: isMobile ? '36px' : '48px',
            fontWeight: 800,
            color: data.color,
            marginBottom: isMobile ? '4px' : '6px',
            lineHeight: 1,
          }}
        >
          {data.label}
        </div>

        {/* 3. Tagline */}
        <div
          style={{
            fontSize: isMobile ? '11px' : '14px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: isMobile ? '12px' : '20px',
          }}
        >
          {data.tagline}
        </div>

        {/* 4. Divisore */}
        <div
          style={{
            height: '1px',
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: isMobile ? '12px' : '20px',
          }}
        />

        {/* 5. Messaggio */}
        <div
          style={{
            fontSize: isMobile ? '13px' : '14px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: isMobile ? '14px' : '24px',
          }}
        >
          {data.message}
        </div>

        {/* Intro testo prima del bundle */}
        <div
          style={{
            fontSize: isMobile ? '11px' : '13px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            marginBottom: isMobile ? '10px' : '16px',
            lineHeight: 1.6
          }}
        >
          Creato per designer e creator che vogliono<br />
          pubblicare la loro prima esperienza XR in pochi giorni.
        </div>

        {/* 6. Box benefici */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: isMobile ? '14px' : '20px',
            width: '100%',
            textAlign: 'left',
            marginBottom: isMobile ? '14px' : '24px',
          }}
        >
          {/* Label bundle */}
          <div
            style={{
              fontSize: isMobile ? '9px' : '10px',
              letterSpacing: isMobile ? '1.5px' : '2px',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              marginBottom: isMobile ? '8px' : '12px',
            }}
          >
            XR RESET BUNDLE
          </div>

          {/* Lista benefici */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '6px' : '8px',
            }}
          >
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              ✓ Setup completo in 7 giorni
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              ✓ Repository pronti all'uso
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              ✓ Community Skool inclusa
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              ✓ Accesso immediato
            </div>
          </div>

          {/* Prezzo */}
          <div
            style={{
              fontSize: isMobile ? '32px' : '36px',
              fontWeight: 800,
              color: data.color,
              marginTop: isMobile ? '10px' : '16px',
              display: 'block',
            }}
          >
            29€
          </div>
        </div>

        {/* 7. Bottone CTA primario */}
        <button
          onClick={() => window.open('https://www.skool.com/spatial-wave-6263', '_blank')}
          style={{
            background: 'linear-gradient(135deg, #00d9ff, #ec4899)',
            color: '#000',
            fontWeight: 800,
            fontSize: isMobile ? '13px' : '14px',
            letterSpacing: '1px',
            padding: isMobile ? '12px 24px' : '16px 32px',
            borderRadius: '8px',
            border: 'none',
            width: '100%',
            cursor: 'pointer',
            marginBottom: isMobile ? '8px' : '12px',
          }}
        >
          INIZIA XR RESET →
        </button>

        {/* 8. Bottone ghost */}
        <button
          onClick={onRestart}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: isMobile ? '12px' : '13px',
            padding: isMobile ? '10px' : '12px',
            borderRadius: '8px',
            width: '100%',
            cursor: 'pointer',
            marginBottom: isMobile ? '8px' : '12px',
          }}
        >
          ← Rifai il quiz
        </button>

        {/* 9. Link testo */}
        <div
          onClick={onBack}
          style={{
            fontSize: isMobile ? '11px' : '12px',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            marginTop: isMobile ? '2px' : '4px',
          }}
        >
          ← Torna alla gallery
        </div>
      </div>
    </div>
  )
}
