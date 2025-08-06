import React from 'react'
import { cn } from '@/lib/utils'

interface HederaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  pulseOnSuccess?: boolean
  className?: string
}

export function HederaLogo({
  size = 'md',
  animated = false,
  pulseOnSuccess = false,
  className = ''
}: HederaLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const baseClasses = `hedera-logo ${sizeClasses[size]} ${className}`

  return (
    <svg
      className={cn(
        sizeClasses[size],
        animated && 'animate-pulse',
        pulseOnSuccess && 'animate-ping',
        className
      )}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hedera Hashgraph Logo"
      role="img"
    >
      {/* Official Hedera Hashgraph Logo - Purple Circle Background */}
      <circle cx="16" cy="16" r="15" fill="#6f42c1" stroke="#6f42c1" strokeWidth="2"/>

      {/* White Inner Circle */}
      <circle cx="16" cy="16" r="12" fill="white"/>

      {/* Hedera H Symbol */}
      <path
        d="M11 8h2v6h6V8h2v16h-2v-6h-6v6h-2V8z"
        fill="#6f42c1"
      />
    </svg>
  )
}

export function HederaTextLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <HederaLogo size="sm" />
      <span className="font-semibold text-purple-600">Hedera</span>
    </div>
  )
} 