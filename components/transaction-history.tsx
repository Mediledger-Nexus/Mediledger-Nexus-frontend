"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { 
  HederaTransaction, 
  createMockTransaction, 
  TRANSACTION_TYPES,
  generateTransactionId 
} from '@/lib/hedera-utils'
import { format } from 'date-fns'

interface TransactionHistoryProps {
  className?: string
  maxTransactions?: number
}

export function TransactionHistory({ className, maxTransactions = 10 }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<HederaTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate sample transactions
  useEffect(() => {
    const sampleTransactions: HederaTransaction[] = [
      createMockTransaction('PATIENT_UPDATE', 'Updated patient demographics'),
      createMockTransaction('RECORD_ACCESS', 'Accessed medical records'),
      createMockTransaction('CONSENT_GRANT', 'Granted consent for data sharing'),
      createMockTransaction('DATA_SHARE', 'Shared data with healthcare provider'),
      createMockTransaction('PATIENT_UPDATE', 'Updated contact information'),
    ]
    setTransactions(sampleTransactions)
  }, [])

  const addTransaction = async (type: HederaTransaction['type'], description: string) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
    
    const newTransaction = createMockTransaction(type, description)
    setTransactions(prev => [newTransaction, ...prev.slice(0, maxTransactions - 1)])
    setIsLoading(false)
  }

  const getStatusIcon = (status: HederaTransaction['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: HederaTransaction['status']) => {
    const variants = {
      SUCCESS: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    )
  }

  const formatFee = (fee: number) => {
    return `$${fee.toFixed(4)}`
  }

  return (
    <div className={className}>
      <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Transaction History
            <Badge variant="outline" className="ml-auto bg-purple-100/10 text-purple-300 border-purple-300/20">
              {transactions.length} transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.status)}
                    <div>
                      <h4 className="font-medium text-white">{TRANSACTION_TYPES[tx.type]}</h4>
                      <p className="text-sm text-gray-400">{tx.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(tx.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Transaction ID:</span>
                    <div className="font-mono text-xs text-purple-300 break-all">
                      {tx.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Timestamp:</span>
                    <div className="text-white">
                      {format(new Date(tx.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Fee:</span>
                    <div className="text-green-400 font-medium">
                      {formatFee(tx.fee)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                      onClick={() => window.open(tx.hashScanUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-purple-300">Submitting to Hedera...</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 