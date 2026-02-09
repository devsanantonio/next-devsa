"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface MagenClientResult {
  session_id: string
  verdict: 'verified' | 'unverified' | 'review'
  score: number
  is_human: boolean
}

interface UseMagenReturn {
  verify: () => Promise<MagenClientResult | null>
  verifyOnServer: (sessionId: string) => Promise<{
    verified: boolean
    verdict?: string
    score?: number
    is_human?: boolean
    session_id?: string
  }>
  isVerifying: boolean
  isReady: boolean
  result: MagenClientResult | null
}

/**
 * Hook for MAGEN Trust verification.
 *
 * On mount, creates a verification session via /api/magen/start-session.
 * On form submit, call verify() which checks the session via /api/magen/verify.
 * The server re-verifies independently for tamper-proof protection.
 */
export function useMagen(): UseMagenReturn {
  const [isReady, setIsReady] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<MagenClientResult | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Create a MAGEN session when the component mounts
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('/api/magen/start-session', { method: 'POST' })
        if (!res.ok) return

        const data = await res.json()
        if (data.sessionId) {
          sessionIdRef.current = data.sessionId
          setIsReady(true)
        }
      } catch {
        // MAGEN not available — forms still work without it
        console.log('MAGEN: Could not create session, continuing without verification')
      }
    }

    initSession()
  }, [])

  // Verify the current session via our API route
  const verify = useCallback(async (): Promise<MagenClientResult | null> => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return null

    setIsVerifying(true)
    try {
      const res = await fetch('/api/magen/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })

      if (!res.ok) return null

      const data = await res.json()
      const clientResult: MagenClientResult = {
        session_id: data.session_id || sessionId,
        verdict: data.verdict || 'review',
        score: data.score ?? 0,
        is_human: data.is_human ?? false,
      }
      setResult(clientResult)
      return clientResult
    } catch (error) {
      console.error('MAGEN verify error:', error)
      return null
    } finally {
      setIsVerifying(false)
    }
  }, [])

  // Server-side re-verification (called from form submit handlers)
  const verifyOnServer = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/magen/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })

      if (response.ok) {
        return await response.json()
      }

      return { verified: false }
    } catch {
      return { verified: false }
    }
  }, [])

  return { verify, verifyOnServer, isVerifying, isReady, result }
}
