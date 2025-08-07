"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { HederaLogo, HederaTextLogo } from '@/components/ui/hedera-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Shield, Zap, Globe } from 'lucide-react'

export function HederaFooter() {
  return (
    <footer className="bg-slate-900 border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/mediledger-logo.jpeg" 
                alt="MediLedger Nexus Logo" 
                className="w-8 h-8 rounded"
              />
              <HederaLogo size="sm" />
              <span className="text-xl font-bold text-white">MediLedger Nexus</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The future of healthcare is decentralized. Own your medical data, control access, 
              and unlock personalized AI-driven insights with MediLedger Nexus.
            </p>
            
            {/* Powered by Hedera Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-2"
            >
              <HederaLogo size="sm" animated={true} />
              <span className="text-purple-300 font-medium">Powered by Hedera Hashgraph</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                Live
              </Badge>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Patient Portal</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Healthcare Providers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Data Analytics</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">API Documentation</a></li>
            </ul>
          </div>

          {/* Hedera Integration */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hedera Integration</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a 
                  href="https://hashscan.io/testnet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  HashScan Explorer
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.hedera.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Hedera Docs
                </a>
              </li>
              <li>
                <a 
                  href="https://portal.hedera.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Hedera Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>&copy; 2025 MediLedger Nexus. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-purple-400 transition-colors">HIPAA Compliance</a>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Testnet Connected</span>
              </div>
              <Badge variant="outline" className="bg-purple-100/10 text-purple-300 border-purple-300/20">
                <Zap className="w-3 h-3 mr-1" />
                Hedera Network
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 