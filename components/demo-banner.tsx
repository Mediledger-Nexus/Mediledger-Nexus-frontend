"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { AlertTriangle, Wifi, WifiOff, Settings } from 'lucide-react'
import { getNetworkStatus, isDemoMode, NetworkStatus } from '@/lib/hedera-utils'

interface DemoBannerProps {
  className?: string
  onModeChange?: (mode: 'MOCK' | 'TESTNET') => void
}

export function DemoBanner({ className, onModeChange }: DemoBannerProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    mode: 'MOCK',
    status: 'ONLINE',
    latency: 25
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(getNetworkStatus())
    }

    updateNetworkStatus()
    const interval = setInterval(updateNetworkStatus, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: NetworkStatus['status']) => {
    switch (status) {
      case 'ONLINE':
        return 'text-green-400'
      case 'OFFLINE':
        return 'text-red-400'
      case 'CONNECTING':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: NetworkStatus['status']) => {
    switch (status) {
      case 'ONLINE':
        return <Wifi className="w-4 h-4 text-green-400" />
      case 'OFFLINE':
        return <WifiOff className="w-4 h-4 text-red-400" />
      case 'CONNECTING':
        return <Wifi className="w-4 h-4 text-yellow-400 animate-pulse" />
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />
    }
  }

  if (!isDemoMode()) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm ${className}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="font-semibold text-yellow-100">Demo Mode</span>
              <span className="text-yellow-200/80 ml-2">Mock Hedera Transactions</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(networkStatus.status)}
              <span className={`text-sm ${getStatusColor(networkStatus.status)}`}>
                {networkStatus.status}
              </span>
              {networkStatus.latency && (
                <span className="text-xs text-gray-400">
                  {networkStatus.latency}ms
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-yellow-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-yellow-200/80">Network Mode:</span>
                    <Badge variant="outline" className="ml-2 bg-purple-100/10 text-purple-300 border-purple-300/20">
                      {networkStatus.mode}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-yellow-200/80">Latency:</span>
                    <span className="ml-2 text-sm text-green-400">
                      {networkStatus.latency}ms
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-yellow-200/80">Testnet Mode:</span>
                <Switch
                  checked={networkStatus.mode === 'TESTNET'}
                  onCheckedChange={(checked) => {
                    const newMode = checked ? 'TESTNET' : 'MOCK'
                    setNetworkStatus(prev => ({ ...prev, mode: newMode }))
                    onModeChange?.(newMode)
                  }}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 