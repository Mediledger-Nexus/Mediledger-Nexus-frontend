// Hedera Hashgraph Integration Utilities
// Mock implementation for hackathon demo

export interface HederaTransaction {
  id: string
  type: 'PATIENT_UPDATE' | 'RECORD_ACCESS' | 'CONSENT_GRANT' | 'DATA_SHARE'
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  timestamp: string
  fee: number
  hashScanUrl: string
  description: string
}

export interface NetworkStatus {
  mode: 'MOCK' | 'TESTNET' | 'MAINNET'
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING'
  latency?: number
}

// Generate realistic testnet transaction IDs
export function generateTransactionId(): string {
  const accountId = Math.floor(Math.random() * 999999) + 100000
  const timestamp = Date.now().toString()
  return `0.0.${accountId}@${timestamp}`
}

// Generate mock HashScan URLs
export function generateHashScanUrl(txId: string, mode: 'MOCK' | 'TESTNET' = 'MOCK'): string {
  if (mode === 'MOCK') {
    return `https://hashscan.io/testnet/transaction/${txId}`
  }
  return `https://hashscan.io/testnet/transaction/${txId}`
}

// Generate realistic fee estimates
export function generateFee(): number {
  return Math.random() * 0.0009 + 0.0001 // $0.0001 - $0.001
}

// Create mock transaction
export function createMockTransaction(
  type: HederaTransaction['type'],
  description: string
): HederaTransaction {
  const txId = generateTransactionId()
  const fee = generateFee()
  
  return {
    id: txId,
    type,
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    fee,
    hashScanUrl: generateHashScanUrl(txId),
    description
  }
}

// Simulate network delay
export function simulateNetworkDelay(): Promise<void> {
  const delay = Math.random() * 1000 + 1000 // 1-2 seconds
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Network status management
export function getNetworkStatus(): NetworkStatus {
  return {
    mode: 'MOCK',
    status: 'ONLINE',
    latency: Math.floor(Math.random() * 50) + 10 // 10-60ms
  }
}

// Transaction type descriptions
export const TRANSACTION_TYPES = {
  PATIENT_UPDATE: 'Patient record update',
  RECORD_ACCESS: 'Medical record access',
  CONSENT_GRANT: 'Consent permission granted',
  DATA_SHARE: 'Data sharing agreement'
} as const

// Hedera branding colors
export const HEDERA_COLORS = {
  primary: '#6f42c1', // Hedera purple
  secondary: '#8b5cf6',
  accent: '#a855f7',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
} as const

// Demo mode utilities
export function isDemoMode(): boolean {
  return process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost'
}

export function getDemoBannerText(): string {
  return 'Demo Mode - Mock Hedera Transactions'
} 

// Generate realistic mock transaction with exact format
export const generateMockTx = () => ({
  txId: `0.0.${Math.floor(1000 + Math.random() * 9000)}@${Date.now().toString().slice(0, 10)}.${Date.now().toString().slice(-9)}`,
  hashscanLink: `https://hashscan.io/testnet/transaction/0.0.${Math.floor(1000 + Math.random() * 9000)}@${Date.now()}`,
  fee: `$${(0.0001 + Math.random() * 0.0005).toFixed(4)} USD`,
  consensus_timestamp: new Date().toISOString(),
  status: Math.random() > 0.2 ? 'SUCCESS' : 'PENDING'
}); 

// Generate AI-enhanced transaction with Groq analysis
export const generateAITx = (symptoms: string) => ({
  ...generateMockTx(), // Original Hedera mock
  groqAnalysis: {
    urgency: Math.floor(1 + Math.random() * 10),
    conditions: ['Possible viral infection'],
    nextSteps: ['Monitor fever']
  },
  symptoms // Store raw input
}); 