"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface MagenVerifyResult {
  session_id: string
  verdict: 'verified' | 'unverified' | 'review'
  score: number
  risk_band: 'low' | 'medium' | 'high'
  is_human: boolean
  sdk_version: string
}

interface UseMagenOptions {
  siteId?: string
  apiKey?: string
}

interface UseMagenReturn {
  verify: () => Promise<MagenVerifyResult | null>
  verifyOnServer: (sessionId: string) => Promise<{
    verified: boolean
    verdict?: string
    score?: number
    is_human?: boolean
    session_id?: string
  }>
  isVerifying: boolean
  isReady: boolean
  result: MagenVerifyResult | null
}

/**
 * Hook for MAGEN Trust verification.
 * 
 * Loads the MAGEN SDK via CDN and provides verify() for client-side
 * verification, plus verifyOnServer() for server-side re-verification.
 */
export function useMagen(options?: UseMagenOptions): UseMagenReturn {
  const [isReady, setIsReady] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<MagenVerifyResult | null>(null)
  const magenRef = useRef<InstanceType<typeof window.MAGEN> | null>(null)

  // Load the MAGEN SDK and initialize
  useEffect(() => {
    const loadMagen = async () => {
      try {
        // Get site config from server if not passed as options
        let siteId = options?.siteId
        let apiKey = options?.apiKey

        if (!siteId) {
          const configRes = await fetch('/api/magen/start-session', { method: 'POST' })
          if (configRes.ok) {
            const config = await configRes.json()
            if (!config.configured) return
            siteId = config.siteId
          } else {
            return
          }
        }

        if (!siteId) return

        // Load SDK script if not already loaded
        if (!document.querySelector('script[src*="magentrust.ai"]')) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.magentrust.ai/v1/magen.min.js'
            script.async = true
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load MAGEN SDK'))
            document.head.appendChild(script)
          })
        }

        // Initialize MAGEN instance
        if (typeof window.MAGEN !== 'undefined') {
          const magen = new window.MAGEN({
            siteId: siteId,
            apiKey: apiKey || '',
          })
          magen.init()
          magenRef.current = magen
          setIsReady(true)
        }
      } catch {
        // MAGEN SDK not available — continue without it
        console.log('MAGEN: SDK not available, continuing without verification')
      }
    }

    loadMagen()
  }, [options?.siteId, options?.apiKey])

  // Client-side verify via the SDK
  const verify = useCallback(async (): Promise<MagenVerifyResult | null> => {
    if (!magenRef.current) return null

    setIsVerifying(true)
    try {
      const verifyResult = await magenRef.current.verify()
      setResult(verifyResult)
      return verifyResult
    } catch (error) {
      console.error('MAGEN verify error:', error)
      return null
    } finally {
      setIsVerifying(false)
    }
  }, [])

  // Server-side re-verification via our API route
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
