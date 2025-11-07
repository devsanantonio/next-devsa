"use client"

/**
 * Performance Detection Utility
 * 
 * Detects device capabilities to determine if expensive shaders should be rendered.
 * Provides graceful degradation for older hardware like Dell Optiplex 790.
 */

export interface DeviceCapabilities {
  canUseShaders: boolean
  canUseComplexAnimations: boolean
  preferReducedMotion: boolean
  memoryLevel: 'low' | 'medium' | 'high'
  gpuTier: 'low' | 'medium' | 'high'
  reason?: string
}

class PerformanceDetector {
  private static instance: PerformanceDetector
  private capabilities: DeviceCapabilities | null = null
  private isDetecting = false

  public static getInstance(): PerformanceDetector {
    if (!PerformanceDetector.instance) {
      PerformanceDetector.instance = new PerformanceDetector()
    }
    return PerformanceDetector.instance
  }

  /**
   * Detect device capabilities with comprehensive checks
   */
  public async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities
    }

    if (this.isDetecting) {
      // Wait for existing detection to complete
      return new Promise((resolve) => {
        const checkCapabilities = () => {
          if (this.capabilities) {
            resolve(this.capabilities)
          } else {
            setTimeout(checkCapabilities, 50)
          }
        }
        checkCapabilities()
      })
    }

    this.isDetecting = true

    try {
      const capabilities = await this.performDetection()
      this.capabilities = capabilities
      this.isDetecting = false
      
      // Cache results in localStorage for faster subsequent loads
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('devsa-performance-capabilities', JSON.stringify({
            ...capabilities,
            timestamp: Date.now()
          }))
        } catch (e) {
          console.warn('Could not cache performance capabilities:', e)
        }
      }

      return capabilities
    } catch (error) {
      console.warn('Performance detection failed, using safe defaults:', error)
      this.isDetecting = false
      this.capabilities = this.getSafeDefaults()
      return this.capabilities
    }
  }

  /**
   * Get cached capabilities if available and recent (within 24 hours)
   */
  public getCachedCapabilities(): DeviceCapabilities | null {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem('devsa-performance-capabilities')
      if (!cached) return null

      const parsed = JSON.parse(cached)
      const age = Date.now() - (parsed.timestamp || 0)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (age > maxAge) {
        localStorage.removeItem('devsa-performance-capabilities')
        return null
      }

      return {
        canUseShaders: parsed.canUseShaders,
        canUseComplexAnimations: parsed.canUseComplexAnimations,
        preferReducedMotion: parsed.preferReducedMotion,
        memoryLevel: parsed.memoryLevel,
        gpuTier: parsed.gpuTier,
        reason: parsed.reason
      }
    } catch {
      return null
    }
  }

  private async performDetection(): Promise<DeviceCapabilities> {
    const checks = await Promise.all([
      this.checkWebGLSupport(),
      this.checkMemoryInfo(),
      this.checkUserAgent(),
      this.checkReducedMotion(),
      this.checkConnectionQuality(),
      this.performCanvasTest()
    ])

    const [webglSupport, memoryInfo, userAgentInfo, reducedMotion, connectionQuality, canvasTest] = checks

    // Determine overall capabilities based on all checks
    let canUseShaders = true
    let canUseComplexAnimations = true
    let memoryLevel: 'low' | 'medium' | 'high' = 'high'
    let gpuTier: 'low' | 'medium' | 'high' = 'high'
    const reasons: string[] = []

    // WebGL support is mandatory for shaders
    if (!webglSupport.supported) {
      canUseShaders = false
      canUseComplexAnimations = false
      reasons.push('No WebGL support')
    }

    // Memory constraints
    if (memoryInfo.level === 'low') {
      canUseShaders = false
      canUseComplexAnimations = false
      memoryLevel = 'low'
      reasons.push('Low memory device')
    } else if (memoryInfo.level === 'medium') {
      memoryLevel = 'medium'
    }

    // User agent detection for known problematic devices
    if (userAgentInfo.isOldDevice) {
      canUseShaders = false
      canUseComplexAnimations = false
      gpuTier = 'low'
      reasons.push('Legacy device detected')
    }

    // Reduced motion preference
    if (reducedMotion) {
      canUseComplexAnimations = false
      reasons.push('User prefers reduced motion')
    }

    // Poor connection quality
    if (connectionQuality === 'slow') {
      canUseShaders = false
      canUseComplexAnimations = false
      reasons.push('Slow network connection')
    }

    // Canvas performance test
    if (canvasTest.fps < 30) {
      canUseShaders = false
      gpuTier = 'low'
      reasons.push('Poor rendering performance')
    } else if (canvasTest.fps < 50) {
      gpuTier = 'medium'
    }

    return {
      canUseShaders,
      canUseComplexAnimations,
      preferReducedMotion: reducedMotion,
      memoryLevel,
      gpuTier,
      reason: reasons.length > 0 ? reasons.join(', ') : undefined
    }
  }

  private async checkWebGLSupport(): Promise<{ supported: boolean, renderer?: string }> {
    if (typeof window === 'undefined') return { supported: false }

    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (!gl) return { supported: false }

      const webglContext = gl as WebGLRenderingContext
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info')
      let renderer = 'Unknown'
      
      if (debugInfo) {
        renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown'
      }

      // Clean up
      const loseContext = webglContext.getExtension('WEBGL_lose_context')
      if (loseContext) {
        loseContext.loseContext()
      }

      return { supported: true, renderer }
    } catch {
      return { supported: false }
    }
  }

  private async checkMemoryInfo(): Promise<{ level: 'low' | 'medium' | 'high', total?: number }> {
    if (typeof window === 'undefined') return { level: 'medium' }

    try {
      // Use device memory API if available
      const nav = navigator as Navigator & { 
        deviceMemory?: number
        performance?: Performance & { memory?: { totalJSHeapSize: number } }
      }
      
      if (nav.deviceMemory) {
        const memory = nav.deviceMemory
        if (memory <= 2) return { level: 'low', total: memory }
        if (memory <= 4) return { level: 'medium', total: memory }
        return { level: 'high', total: memory }
      }

      // Fallback: Use performance memory API
      if (nav.performance?.memory) {
        const memInfo = nav.performance.memory
        const totalMB = memInfo.totalJSHeapSize / (1024 * 1024)
        
        if (totalMB < 256) return { level: 'low' }
        if (totalMB < 512) return { level: 'medium' }
        return { level: 'high' }
      }

      return { level: 'medium' }
    } catch {
      return { level: 'medium' }
    }
  }

  private async checkUserAgent(): Promise<{ isOldDevice: boolean, details: string }> {
    if (typeof window === 'undefined') return { isOldDevice: false, details: '' }

    const ua = navigator.userAgent.toLowerCase()
    
    // Check for specific old hardware patterns
    const oldPatterns = [
      'optiplex', // Dell Optiplex series
      'intel hd graphics', // Old integrated graphics
      'firefox/1', 'firefox/2', 'firefox/3', // Very old Firefox
      'chrome/1', 'chrome/2', 'chrome/3', // Very old Chrome
      'safari/1', 'safari/2', 'safari/3', // Very old Safari
      'android 2', 'android 3', 'android 4.0', // Old Android
      'iphone os 2', 'iphone os 3', 'iphone os 4', // Old iOS
    ]

    const isOldDevice = oldPatterns.some(pattern => ua.includes(pattern))

    return { isOldDevice, details: ua }
  }

  private async checkReducedMotion(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      return mediaQuery.matches
    } catch {
      return false
    }
  }

  private async checkConnectionQuality(): Promise<'fast' | 'medium' | 'slow'> {
    if (typeof window === 'undefined') return 'medium'

    try {
      const nav = navigator as Navigator & { 
        connection?: { 
          effectiveType?: string
          downlink?: number 
        } 
      }
      if (nav.connection) {
        const conn = nav.connection
        
        // Check effective type
        if (conn.effectiveType) {
          if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
            return 'slow'
          }
          if (conn.effectiveType === '3g') {
            return 'medium'
          }
          return 'fast'
        }

        // Check downlink speed
        if (conn.downlink !== undefined) {
          if (conn.downlink < 1) return 'slow'
          if (conn.downlink < 5) return 'medium'
          return 'fast'
        }
      }

      return 'medium'
    } catch {
      return 'medium'
    }
  }

  private async performCanvasTest(): Promise<{ fps: number }> {
    if (typeof window === 'undefined') return { fps: 60 }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      canvas.style.position = 'absolute'
      canvas.style.left = '-9999px'
      canvas.style.top = '-9999px'
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve({ fps: 0 })
        return
      }

      document.body.appendChild(canvas)

      let frameCount = 0
      const startTime = performance.now()
      const maxDuration = 500 // Test for 500ms

      const animate = () => {
        // Simple animation test
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = `hsl(${frameCount * 10}, 50%, 50%)`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        frameCount++
        const elapsed = performance.now() - startTime

        if (elapsed >= maxDuration) {
          const fps = Math.round((frameCount / elapsed) * 1000)
          document.body.removeChild(canvas)
          resolve({ fps })
        } else {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    })
  }

  public getSafeDefaults(): DeviceCapabilities {
    return {
      canUseShaders: false,
      canUseComplexAnimations: false,
      preferReducedMotion: true,
      memoryLevel: 'low',
      gpuTier: 'low',
      reason: 'Safe defaults - detection failed'
    }
  }
}

// Singleton instance
export const performanceDetector = PerformanceDetector.getInstance()

// React hook for easy usage
export function usePerformanceCapabilities() {
  const [capabilities, setCapabilities] = React.useState<DeviceCapabilities | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    const detectCapabilities = async () => {
      try {
        // Check cache first
        const cached = performanceDetector.getCachedCapabilities()
        if (cached && mounted) {
          setCapabilities(cached)
          setIsLoading(false)
          return
        }

        // Perform full detection
        const detected = await performanceDetector.detectCapabilities()
        if (mounted) {
          setCapabilities(detected)
          setIsLoading(false)
        }
      } catch (error) {
        console.warn('Performance detection error:', error)
        if (mounted) {
          setCapabilities(performanceDetector.getSafeDefaults())
          setIsLoading(false)
        }
      }
    }

    detectCapabilities()

    return () => {
      mounted = false
    }
  }, [])

  return { capabilities, isLoading }
}

// Add React import for the hook
import React from 'react'