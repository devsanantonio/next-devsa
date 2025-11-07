"use client"

import { useState } from 'react'
import { usePerformanceCapabilities } from '@/lib/performance-detector'

export function PerformanceIndicator() {
  const { capabilities, isLoading } = usePerformanceCapabilities()
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-[100] bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-mono">
        Detecting...
      </div>
    )
  }

  if (!capabilities) return null

  const indicatorColor = capabilities.canUseShaders ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`${indicatorColor} text-white px-3 py-2 rounded-lg text-sm font-mono font-bold hover:opacity-80 transition-opacity`}
      >
        {capabilities.canUseShaders ? '🚀 FAST' : '🐌 SAFE'}
      </button>
      
      {isExpanded && (
        <div className="absolute top-12 right-0 bg-black/90 text-white p-4 rounded-lg text-xs font-mono min-w-[280px] backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Shaders:</span>
              <span className={capabilities.canUseShaders ? 'text-green-400' : 'text-red-400'}>
                {capabilities.canUseShaders ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Animations:</span>
              <span className={capabilities.canUseComplexAnimations ? 'text-green-400' : 'text-red-400'}>
                {capabilities.canUseComplexAnimations ? 'Full' : 'Reduced'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className={`text-${capabilities.memoryLevel === 'high' ? 'green' : capabilities.memoryLevel === 'medium' ? 'yellow' : 'red'}-400`}>
                {capabilities.memoryLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>GPU Tier:</span>
              <span className={`text-${capabilities.gpuTier === 'high' ? 'green' : capabilities.gpuTier === 'medium' ? 'yellow' : 'red'}-400`}>
                {capabilities.gpuTier.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Reduced Motion:</span>
              <span className={capabilities.preferReducedMotion ? 'text-yellow-400' : 'text-green-400'}>
                {capabilities.preferReducedMotion ? 'Yes' : 'No'}
              </span>
            </div>
            
            {capabilities.reason && (
              <div className="pt-2 border-t border-gray-600">
                <div className="text-gray-400 text-[10px]">
                  Reason: {capabilities.reason}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}