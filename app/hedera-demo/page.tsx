"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import DemoBanner from '@/components/demo-banner'
import { TransactionHistory } from '@/components/transaction-history'
import { SubmitToHedera } from '@/components/submit-to-hedera'
import { HederaFooter } from '@/components/hedera-footer'
import { HederaLogo } from '@/components/ui/hedera-logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Zap, 
  Database, 
  Users, 
  Activity,
  TrendingUp,
  Globe,
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { REAL_HEDERA_EXAMPLE } from '@/lib/constants'

export default function HederaDemoPage() {
  const [selectedTransactionType, setSelectedTransactionType] = useState<'PATIENT_UPDATE' | 'RECORD_ACCESS' | 'CONSENT_GRANT' | 'DATA_SHARE'>('PATIENT_UPDATE')
  const [transactionDescription, setTransactionDescription] = useState('')

  const transactionTypes = [
    { type: 'PATIENT_UPDATE', label: 'Patient Update', icon: Users, description: 'Update patient demographics and information' },
    { type: 'RECORD_ACCESS', label: 'Record Access', icon: Database, description: 'Access medical records and history' },
    { type: 'CONSENT_GRANT', label: 'Consent Grant', icon: Shield, description: 'Grant consent for data sharing' },
    { type: 'DATA_SHARE', label: 'Data Share', icon: Globe, description: 'Share data with healthcare providers' }
  ]

  const handleTransactionComplete = (transaction: any) => {
    console.log('Transaction completed:', transaction)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Demo Banner */}
      <DemoBanner />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <HederaLogo size="lg" animated={true} />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Hedera Integration Demo
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the power of decentralized healthcare with real-time Hedera Hashgraph transactions. 
              Watch as medical data flows securely through the blockchain.
            </p>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
          >
            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">1,247</p>
                    <p className="text-sm text-gray-400">Total Transactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">99.9%</p>
                    <p className="text-sm text-gray-400">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">$0.0003</p>
                    <p className="text-sm text-gray-400">Avg. Fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-900/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">2.1s</p>
                    <p className="text-sm text-gray-400">Avg. Latency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Transaction Type Selection */}
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="w-5 h-5 text-purple-400" />
                  Select Transaction Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {transactionTypes.map((txType) => {
                    const Icon = txType.icon
                    return (
                      <Button
                        key={txType.type}
                        variant={selectedTransactionType === txType.type ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col items-start gap-2 ${
                          selectedTransactionType === txType.type 
                            ? 'bg-purple-600 border-purple-500' 
                            : 'border-purple-500/30 hover:border-purple-500/60'
                        }`}
                        onClick={() => setSelectedTransactionType(txType.type as any)}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">{txType.label}</div>
                          <div className="text-xs opacity-80">{txType.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Transaction Description</label>
                  <textarea
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                    placeholder="Enter transaction description..."
                    className="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    rows={3}
                  />
                </div>

                <SubmitToHedera
                  transactionType={selectedTransactionType}
                  description={transactionDescription || `${transactionTypes.find(t => t.type === selectedTransactionType)?.label} transaction`}
                  onTransactionComplete={handleTransactionComplete}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Hedera Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 font-medium">Network Online</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                      Testnet
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="text-sm text-gray-400">Latency</div>
                      <div className="text-xl font-bold text-purple-400">25ms</div>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="text-sm text-gray-400">TPS</div>
                      <div className="text-xl font-bold text-blue-400">10,000+</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-300">Patient record updated</span>
                      <span className="text-gray-500 ml-auto">2s ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-300">Consent granted</span>
                      <span className="text-gray-500 ml-auto">5s ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-gray-300">Data shared</span>
                      <span className="text-gray-500 ml-auto">12s ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Transaction History Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TransactionHistory />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why Hedera Hashgraph?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hedera provides the security, speed, and scalability needed for enterprise healthcare applications.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                <p className="text-gray-400">
                  Military-grade security with ABFT consensus, perfect for HIPAA-compliant healthcare data.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-400">
                  10,000+ transactions per second with finality in 3-5 seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Regulatory Ready</h3>
                <p className="text-gray-400">
                  Built for compliance with healthcare regulations and data privacy laws.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real Transaction Example Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Real Hedera Testnet Example
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See an actual transaction from the Hedera testnet
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="real-tx-example"
          >
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <a 
                      href={REAL_HEDERA_EXAMPLE.hashscanLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline break-all"
                    >
                      {REAL_HEDERA_EXAMPLE.txId}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="text-green-400">{REAL_HEDERA_EXAMPLE.fee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="text-gray-300">
                      {new Date(REAL_HEDERA_EXAMPLE.consensus_timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <HederaFooter />
    </div>
  )
} 