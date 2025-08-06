"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HederaLogo } from '@/components/ui/hedera-logo'
import { createMockTransaction, simulateNetworkDelay } from '@/lib/hedera-utils'
import { toast } from 'sonner'
import { Send, CheckCircle, Loader2 } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { useToast } from '@/components/ui/use-toast'

interface SubmitToHederaProps {
  transactionType: 'PATIENT_UPDATE' | 'RECORD_ACCESS' | 'CONSENT_GRANT' | 'DATA_SHARE'
  description: string
  onTransactionComplete?: (transaction: any) => void
  className?: string
}

export function SubmitToHedera({ 
  transactionType, 
  description, 
  onTransactionComplete,
  className 
}: SubmitToHederaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const logo = document.querySelector('.hedera-logo');
    if (isSubmitting) logo?.classList.add('active');
    else logo?.classList.remove('active');
  }, [isSubmitting]);

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setIsSuccess(false)

    try {
      // Simulate network delay
      await simulateNetworkDelay()
      
      // Create mock transaction
      const transaction = createMockTransaction(transactionType, description)
      
      // Show success state
      setIsSuccess(true)
      
      // Show toast notification
      toast.success('Transaction submitted to Hedera!', {
        description: `TX ID: ${transaction.id}`,
        action: {
          label: 'View on HashScan',
          onClick: () => window.open(transaction.hashScanUrl, '_blank')
        }
      })

      // Call callback
      onTransactionComplete?.(transaction)

      // Reset after 2 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setIsSubmitting(false)
      }, 2000)

    } catch (error) {
      toast.error('Transaction failed', {
        description: 'Please try again'
      })
      setIsSubmitting(false)
    }
  }

  const buttonVariants = {
    idle: { scale: 1 },
    submitting: { scale: 0.95 },
    success: { scale: 1.05 }
  }

  const logoVariants = {
    idle: { rotate: 0 },
    submitting: { rotate: 360 },
    success: { scale: 1.2 }
  }

  return (
    <motion.div
      className={className}
      variants={buttonVariants}
      animate={isSuccess ? 'success' : isSubmitting ? 'submitting' : 'idle'}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`
          relative overflow-hidden
          bg-gradient-to-r from-purple-600 to-purple-700
          hover:from-purple-700 hover:to-purple-800
          text-white font-semibold px-6 py-3
          rounded-full shadow-lg hover:shadow-purple-500/25
          transition-all duration-300
          ${isSuccess ? 'bg-gradient-to-r from-green-600 to-green-700' : ''}
        `}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"
          animate={{
            x: isSubmitting ? ['0%', '100%'] : '0%'
          }}
          transition={{
            duration: 1.5,
            repeat: isSubmitting ? Infinity : 0,
            ease: 'linear'
          }}
        />
        
        <div className="relative flex items-center gap-3">
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting to Hedera...</span>
            </>
          ) : isSuccess ? (
            <>
              <motion.div
                variants={logoVariants}
                animate="success"
                transition={{ duration: 0.3 }}
              >
                <HederaLogo size="sm" pulseOnSuccess={true} />
              </motion.div>
              <CheckCircle className="w-5 h-5" />
              <span>Submitted Successfully!</span>
            </>
          ) : (
            <>
              <motion.div
                variants={logoVariants}
                animate={isSubmitting ? 'submitting' : 'idle'}
                transition={{ duration: 0.5 }}
              >
                <HederaLogo size="sm" />
              </motion.div>
              <Send className="w-5 h-5" />
              <span>Simulate Transaction</span>
            </>
          )}
        </div>
      </Button>
    </motion.div>
  )
} 