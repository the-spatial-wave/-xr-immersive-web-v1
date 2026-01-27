import { useEffect, useRef } from 'react'

export function useSceneAudio(
  src: string,
  options: {
    volume?: number
    loop?: boolean
    autoplay?: boolean
  } = {}
) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)

  const {
    volume = 0.35,
    loop = true,
    autoplay = true
  } = options

  useEffect(() => {
    if (!autoplay) return

    // Create audio element
    const audio = new Audio(src)
    audio.loop = loop
    audio.preload = 'auto'
    audio.volume = volume
    audioRef.current = audio

    const tryPlay = async () => {
      if (!audioRef.current || startedRef.current) return

      try {
        await audioRef.current.play()
        startedRef.current = true
        console.log('🎵 Audio started:', src)
      } catch  {
        console.warn('🔇 Autoplay blocked - will retry on user interaction')
      }
    }

    // Try immediately
    void tryPlay()

    // Retry on first user interaction (mobile-safe)
    const resume = () => {
      void tryPlay()
    }

    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('touchstart', resume, { once: true })
    window.addEventListener('click', resume, { once: true })

    // Cleanup
    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('touchstart', resume)
      window.removeEventListener('click', resume)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      startedRef.current = false
      console.log('🛑 Audio stopped:', src)
    }
  }, [src, volume, loop, autoplay])

  return audioRef
}