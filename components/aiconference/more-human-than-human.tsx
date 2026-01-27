"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Calendar, MapPin, Tv, Send, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

const sessionFormats = [
  { id: "talk", label: "Talk (30-45 min)", description: "Standard presentation with Q&A" },
  { id: "lightning", label: "Lightning Talk (10 min)", description: "Quick, focused presentation" },
]

interface Track {
  id: string
  title: string
  artist: string
  duration: string
  url: string
}

// Demo tracks using SoundHelix (royalty-free sample music)
const tracks: Track[] = [
  {
    id: "001",
    title: "Neural Interface Alpha",
    artist: "SoundHelix",
    duration: "06:12",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "002",
    title: "Quantum State Beta",
    artist: "SoundHelix",
    duration: "05:45",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "003",
    title: "Cybernetic Dreams",
    artist: "SoundHelix",
    duration: "04:58",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "004",
    title: "Digital Horizon",
    artist: "SoundHelix",
    duration: "05:33",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "005",
    title: "Machine Consciousness",
    artist: "SoundHelix",
    duration: "06:01",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
]

// Aztec-inspired geometric pattern for background
function AztecBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#ff9900 1px, transparent 1px),
            linear-gradient(90deg, #ff9900 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#ff9900]/5 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#00f2ff]/5 blur-[150px]" />
    </div>
  )
}

// Corner decoration component
function AztecCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const rotations = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  }
  
  return (
    <div className={`w-12 h-12 lg:w-16 lg:h-16 ${rotations[position]}`}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M0 0h8v64H0z" fill="#333" />
        <path d="M0 0h64v8H0z" fill="#333" />
        <path d="M16 16h4v24h-4z" fill="#ff9900" opacity="0.6" />
        <path d="M16 16h24v4H16z" fill="#ff9900" opacity="0.6" />
        <path d="M28 28h2v12h-2z" fill="#00f2ff" opacity="0.4" />
        <path d="M28 28h12v2H28z" fill="#00f2ff" opacity="0.4" />
      </svg>
    </div>
  )
}

// Border decoration
function AztecBorder() {
  return (
    <div className="h-1 w-full bg-linear-to-r from-[#ff9900] via-[#00f2ff] to-[#ff9900] opacity-60" />
  )
}

export function MoreHumanThanHuman() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSubmitted = searchParams.get('submitted') === 'true'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    sessionTitle: "",
    sessionFormat: "",
    abstract: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magenSessionId, setMagenSessionId] = useState<string | null>(null)

  // Terminal Player State
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const addTerminalLine = (line: string) => {
    setTerminalLines((prev) => [...prev.slice(-15), line])
  }

  // Terminal boot sequence
  useEffect(() => {
    if (isPlayerOpen && terminalLines.length === 0) {
      const bootSequence = [
        "DEVSA_AUDIO_SYSTEM v2.026",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "Initializing audio subsystem...",
        "Loading CC0 licensed tracks...",
        "Source: soundhelix.com (demo)",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `[${tracks.length}] tracks loaded`,
        "",
        "Click track to begin playback",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      ]
      bootSequence.forEach((line, i) => {
        setTimeout(() => addTerminalLine(line), i * 80)
      })
    }
  }, [isPlayerOpen, terminalLines.length])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      addTerminalLine(`[ENDED] ${currentTrack?.title}`)
      const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id)
      if (currentIndex < tracks.length - 1) {
        handlePlayTrack(tracks[currentIndex + 1])
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [currentTrack])

  const handlePlayTrack = (track: Track) => {
    if (audioRef.current) {
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
          addTerminalLine(`[PAUSED] ${track.title}`)
        } else {
          audioRef.current.play()
          setIsPlaying(true)
          addTerminalLine(`[RESUMED] ${track.title}`)
        }
      } else {
        setCurrentTrack(track)
        audioRef.current.src = track.url
        audioRef.current.volume = volume
        audioRef.current.play()
        setIsPlaying(true)
        addTerminalLine(`[LOADING] ${track.id} :: ${track.title}`)
        addTerminalLine(`[PLAYING] Artist: ${track.artist}`)
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    addTerminalLine(`[VOLUME] ${Math.round(newVolume * 100)}%`)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      audioRef.current.currentTime = percentage * duration
    }
  }

  useEffect(() => {
    const startMagenSession = async () => {
      try {
        const response = await fetch('/api/magen/start-session', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          setMagenSessionId(data?.sessionId || null)
        }
      } catch {
        // MAGEN not available
      }
    }

    startMagenSession()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Verify Magen session before proceeding (if available)
      let verifiedHumanScore: number | undefined;
      if (magenSessionId) {
        const verifyResponse = await fetch('/api/magen/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: magenSessionId }),
        })
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json()
          verifiedHumanScore = verifyData.humanScore
          if (verifyData.humanScore !== undefined && verifyData.humanScore < 0.7) {
            setError("Verification failed. Please try again.")
            setIsSubmitting(false)
            return
          }
        }
      }

      // Submit to API with verified human score
      const response = await fetch('/api/call-for-speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          magenSessionId,
          magenHumanScore: verifiedHumanScore,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit proposal')
      }

      router.push('/events/morehumanthanhuman?submitted=true')
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#0a0a0a] overflow-x-hidden">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Video Hero Section */}
      <section className="relative h-dvh overflow-hidden" data-bg-type="dark">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source 
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/HEAD_v01.mp4" 
              type="video/mp4" 
            />
            <source 
              src="https://devsa-assets.s3.us-east-2.amazonaws.com/HEAD_v01.webm" 
              type="video/webm" 
            />
          </video>
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center px-4"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white uppercase tracking-tight leading-[0.9] mb-6">
              <span className="text-[#fbbf24] block">More Human</span>
              <span className="block mt-1">Than Human</span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl font-semibold uppercase tracking-widest">
              AI Conference • February 28, 2026 • Geekdom
            </p>
          </motion.div>
        </div>

        {/* Terminal Music Player Toggle */}
        <motion.button
          onClick={() => setIsPlayerOpen(!isPlayerOpen)}
          className="absolute bottom-6 right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center border border-[#333] bg-[#0a0a0a]/90 backdrop-blur-sm font-mono text-xs uppercase tracking-wider text-[#ff9900] transition-all hover:border-[#ff9900] hover:bg-[#ff9900] hover:text-[#0a0a0a] glitch-hover"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isPlayerOpen ? "Close audio player" : "Open audio player"}
        >
          {isPlaying ? (
            <div className="flex items-center gap-0.5">
              <span className="inline-block h-3 w-0.5 animate-pulse bg-current" style={{ animationDelay: "0ms" }} />
              <span className="inline-block h-4 w-0.5 animate-pulse bg-current" style={{ animationDelay: "150ms" }} />
              <span className="inline-block h-2 w-0.5 animate-pulse bg-current" style={{ animationDelay: "300ms" }} />
              <span className="inline-block h-5 w-0.5 animate-pulse bg-current" style={{ animationDelay: "450ms" }} />
            </div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          )}
        </motion.button>

        {/* Terminal Player Window */}
        <AnimatePresence>
          {isPlayerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-6 md:bottom-24 right-6 z-50 w-95 max-w-[calc(100vw-3rem)] border border-[#333] bg-[#0a0a0a] shadow-2xl shadow-black/50"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-[#333] bg-[#111] px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setIsPlayerOpen(false)}
                      className="h-2.5 w-2.5 bg-[#ff5f56] transition-opacity hover:opacity-80"
                      aria-label="Close terminal"
                    />
                    <div className="h-2.5 w-2.5 bg-[#ffbd2e]" />
                    <div className="h-2.5 w-2.5 bg-[#27ca40]" />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#737373]">DEVSA_AUDIO.exe</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#525252]">
                  <span className={isPlaying ? "text-[#00f2ff]" : "text-[#525252]"}>
                    {isPlaying ? "STREAMING" : "IDLE"}
                  </span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isPlaying ? "#00f2ff" : "#333" }} />
                </div>
              </div>

              {/* Terminal Output */}
              <div ref={terminalRef} className="h-28 overflow-y-auto bg-[#0a0a0a] p-3 font-mono text-[11px] leading-relaxed">
                {terminalLines.map((line, i) => (
                  <div key={i} className="text-[#525252]">
                    {line.startsWith("[PLAYING]") || line.startsWith("[RESUMED]") ? (
                      <span className="text-[#00f2ff]">{line}</span>
                    ) : line.startsWith("[PAUSED]") || line.startsWith("[ENDED]") ? (
                      <span className="text-[#ff9900]">{line}</span>
                    ) : line.startsWith("[LOADING]") ? (
                      <span className="text-[#a3a3a3]">{line}</span>
                    ) : line.startsWith("[VOLUME]") ? (
                      <span className="text-[#525252]">{line}</span>
                    ) : (
                      line
                    )}
                  </div>
                ))}
                <div className="flex items-center text-[#ff9900]">
                  <span className="mr-1">{">"}</span>
                  <span className="inline-block h-3 w-1.5 animate-pulse bg-[#ff9900]" />
                </div>
              </div>

              {/* Track List */}
              <div className="border-t border-[#333] bg-[#0c0c0c]">
                <div className="border-b border-[#222] px-3 py-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#525252]">
                    Available Tracks
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handlePlayTrack(track)}
                      className={`group flex w-full items-center gap-3 border-b border-[#222]/50 px-3 py-2.5 text-left transition-all hover:bg-[#151515] ${
                        currentTrack?.id === track.id ? "bg-[#151515]" : ""
                      }`}
                    >
                      <span className="w-7 font-mono text-[9px] font-bold text-[#525252]">{track.id}</span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`truncate font-mono text-xs font-semibold tracking-wide leading-snug ${
                            currentTrack?.id === track.id ? "text-[#ff9900]" : "text-[#e5e5e5] group-hover:text-[#ff9900]"
                          }`}
                        >
                          {track.title}
                        </div>
                        <div className="font-mono text-[9px] text-[#525252] leading-tight mt-0.5">{track.artist}</div>
                      </div>
                      <span className="font-mono text-[9px] font-medium text-[#525252]">{track.duration}</span>
                      {currentTrack?.id === track.id && isPlaying && (
                        <div className="flex items-center gap-0.5">
                          <span className="inline-block h-2 w-0.5 animate-pulse bg-[#00f2ff]" style={{ animationDelay: "0ms" }} />
                          <span className="inline-block h-3 w-0.5 animate-pulse bg-[#00f2ff]" style={{ animationDelay: "100ms" }} />
                          <span className="inline-block h-1.5 w-0.5 animate-pulse bg-[#00f2ff]" style={{ animationDelay: "200ms" }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Controls */}
              {currentTrack && (
                <div className="border-t border-[#333] bg-[#111] p-3">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div
                      onClick={handleSeek}
                      className="group relative h-1 cursor-pointer bg-[#222]"
                    >
                      <div
                        className="absolute left-0 top-0 h-full bg-[#ff9900] transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 h-2.5 w-1 -translate-y-1/2 bg-[#ff9900] opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between font-mono text-[9px] font-medium text-[#525252]">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Play/Pause */}
                      <button
                        onClick={() => handlePlayTrack(currentTrack)}
                        className="flex h-8 w-8 items-center justify-center border border-[#333] bg-[#0a0a0a] text-[#e5e5e5] transition-all hover:border-[#ff9900] hover:text-[#ff9900]"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        )}
                      </button>
                      {/* Skip */}
                      <button
                        onClick={() => {
                          const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id)
                          if (currentIndex < tracks.length - 1) {
                            handlePlayTrack(tracks[currentIndex + 1])
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center border border-[#333] bg-[#0a0a0a] text-[#e5e5e5] transition-all hover:border-[#ff9900] hover:text-[#ff9900]"
                        aria-label="Next track"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,4 15,12 5,20" />
                          <rect x="15" y="4" width="4" height="16" />
                        </svg>
                      </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#525252]">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                        {volume > 0.5 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
                        {volume > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="h-1 w-14 cursor-pointer appearance-none bg-[#222] [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-[#ff9900]"
                      />
                      <span className="w-7 font-mono text-[9px] font-medium text-[#525252]">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>

                  {/* Now Playing */}
                  <div className="mt-3 truncate border-t border-[#222]/50 pt-2 font-mono text-[9px] uppercase tracking-widest text-[#525252]">
                    Now Playing: <span className="text-[#00f2ff] font-semibold">{currentTrack.title}</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-[#222] bg-[#0a0a0a] px-3 py-1.5">
                <span className="font-mono text-[8px] tracking-wider text-[#333]">
                  Royalty-Free Demo • Replace with CC0 tracks for production
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Call for Speakers Section */}
      <section className="relative min-h-dvh flex items-center pt-20 sm:pt-16 pb-6 sm:pb-0 scanlines grain" data-bg-type="dark">
        <AztecBackground />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 lg:top-4 lg:left-4 hidden sm:block">
          <AztecCorner position="top-left" />
        </div>
        <div className="absolute top-3 right-3 lg:top-4 lg:right-4 hidden sm:block">
          <AztecCorner position="top-right" />
        </div>
        <div className="absolute bottom-3 left-3 lg:bottom-4 lg:left-4 hidden sm:block">
          <AztecCorner position="bottom-left" />
        </div>
        <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 hidden sm:block">
          <AztecCorner position="bottom-right" />
        </div>

        {/* Top border */}
        <div className="absolute top-0 left-0 right-0">
          <AztecBorder />
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-14 items-start lg:items-center">
            
            {/* Left Column - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              {/* DEVSA TV Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#333] bg-[#111]/80 backdrop-blur-sm"
              >
                <Tv className="w-3.5 h-3.5 text-[#ff9900]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#a3a3a3] tracking-[0.15em] uppercase">DEVSA TV Recording</span>
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-3 sm:mb-4 leading-[0.9] text-glitch"
              >
                <span className="block text-[#e5e5e5]">More Human</span>
                <span className="block text-[#ff9900] mt-0.5 sm:mt-1">Than Human</span>
              </motion.h1>

              {/* Subtitle & Tagline Combined */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }}
                className="mb-4 sm:mb-6"
              >
                <h2 className="font-mono text-lg md:text-xl text-[#00f2ff] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium mb-2 sm:mb-3">
                  DEVSA AI Conference
                </h2>
                <p className="font-mono text-sm text-[#737373] tracking-wide leading-relaxed max-w-md mx-auto lg:mx-0">
                  Join San Antonio's builders, dreamers, and technologists as we explore how AI is transforming the way we write code, test, automate, and ship. Submit your talk and share your expertise with the San Antonio tech community.
                </p>
              </motion.div>

              {/* Event Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col md:flex-wrap items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-6 mb-4 sm:mb-6"
              >
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#e5e5e5]">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff9900]" />
                  <span className="tracking-wide">February 28, 2026</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-[#333]" />
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#e5e5e5]">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00f2ff]" />
                  <span className="tracking-wide">Geekdom, San Antonio TX</span>
                </div>
              </motion.div>

              {/* Deadline Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="inline-flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border border-[#ff9900]/30 bg-[#ff9900]/5"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-[#ff9900]/50 text-[#ff9900]">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-left">
                  <p className="font-mono text-[9px] sm:text-[10px] text-[#737373] uppercase tracking-wider">Deadline</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#e5e5e5]">February 2, 2026</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Form or Success Message */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full"
            >
              {isSubmitted ? (
                <div className="border border-[#333] bg-[#111]/80 backdrop-blur-sm p-6 sm:p-8 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[#00f2ff]/50 bg-[#00f2ff]/10">
                    <CheckCircle className="h-8 w-8 text-[#00f2ff]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    Proposal Submitted!
                  </h3>
                  <p className="text-[#a3a3a3] leading-relaxed mb-6">
                    Thank you for your speaker proposal. Our team will review your submission and get back to you by email.
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 bg-[#ff9900] px-5 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#00f2ff]"
                  >
                    <span className="font-mono">Back to Events</span>
                  </Link>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Speaker Information */}
                <div className="border border-[#333] bg-[#111]/80 backdrop-blur-sm p-3 sm:p-4">
                  <h3 className="font-mono text-xs text-[#00f2ff] tracking-[0.15em] uppercase mb-3">
                    Speaker Info
                  </h3>
                  <div className="space-y-2">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                          Full Name <span className="text-[#ff9900]">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                          Email <span className="text-[#ff9900]">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {/* Talk Details */}
                <div className="border border-[#333] bg-[#111]/80 backdrop-blur-sm p-3 sm:p-4">
                  <h3 className="font-mono text-xs text-[#00f2ff] tracking-[0.15em] uppercase mb-3">
                    Talk Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="sessionTitle" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                        Talk Title <span className="text-[#ff9900]">*</span>
                      </label>
                      <input
                        type="text"
                        id="sessionTitle"
                        name="sessionTitle"
                        required
                        value={formData.sessionTitle}
                        onChange={handleInputChange}
                        className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all"
                        placeholder="Your talk title"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#a3a3a3]">
                        Format <span className="text-[#ff9900]">*</span>
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sessionFormats.map((format) => (
                          <label
                            key={format.id}
                            className={`flex cursor-pointer items-center gap-2.5 border p-3 transition-all ${
                              formData.sessionFormat === format.id
                                ? "border-[#ff9900] bg-[#ff9900]/10"
                                : "border-[#333] hover:border-[#525252] bg-[#0a0a0a]"
                            }`}
                          >
                            <input
                              type="radio"
                              name="sessionFormat"
                              value={format.id}
                              checked={formData.sessionFormat === format.id}
                              onChange={handleInputChange}
                              className="h-3.5 w-3.5 accent-[#ff9900]"
                              required
                            />
                            <div>
                              <span className="block text-xs font-semibold text-[#e5e5e5]">{format.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="abstract" className="mb-1.5 block text-xs font-medium text-[#a3a3a3]">
                        Abstract <span className="text-[#ff9900]">*</span>
                      </label>
                      <textarea
                        id="abstract"
                        name="abstract"
                        required
                        rows={3}
                        value={formData.abstract}
                        onChange={handleInputChange}
                        className="w-full border border-[#333] bg-[#0a0a0a] px-3 py-2.5 text-sm leading-relaxed text-[#e5e5e5] placeholder:text-[#525252] focus:border-[#ff9900] focus:outline-none transition-all resize-none"
                        placeholder="Describe your talk (150-300 words)"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="space-y-2">
                  {error && (
                    <div className="flex items-start gap-2.5 border border-red-500/30 bg-red-500/10 p-3">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex w-full items-center justify-center gap-2 bg-[#ff9900] px-5 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-all hover:bg-[#00f2ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-mono">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono">Submit Proposal</span>
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-[#525252]">
                    
                    Protected by{" "}
                    <Link
                      href="https://magentrust.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#b45309] hover:text-[#ff9900] transition-colors"
                    >
                      Magen
                    </Link>
                  </p>
                </div>
              </form>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0">
          <AztecBorder />
        </div>
      </section>
    </main>
  )
}
