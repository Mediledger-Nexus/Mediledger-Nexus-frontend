"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Cpu, Database, Lock, Brain, Zap, Code, Users } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BackgroundVideo } from "@/components/background-video"

export default function FeaturesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Tech Stack Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/futuristic-dashboard.gif"
          alt="Futuristic dashboard animation"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold text-center mb-20 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Cutting-Edge Tech Stack
          </motion.h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Database,
                name: "Hedera Hashgraph",
                desc: "Enterprise-grade DLT for consensus and immutable records",
              },
              { icon: Shield, name: "zk-SNARKs", desc: "Zero-knowledge proofs for privacy-preserving verification" },
              { icon: Cpu, name: "IPFS", desc: "Decentralized storage for encrypted medical data" },
              { icon: Code, name: "HL7 FHIR", desc: "Healthcare interoperability standard compliance" },
              { icon: Brain, name: "Federated AI", desc: "Privacy-preserving machine learning algorithms" },
              { icon: Lock, name: "AES-256", desc: "Military-grade encryption for data protection" },
              { icon: Zap, name: "GraphQL", desc: "Efficient API for real-time data queries" },
              { icon: Users, name: "OAuth 2.0", desc: "Secure authentication and authorization" },
            ].map((tech, index) => (
              <motion.div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
                variants={fadeInUp}
              >
                <tech.icon className="h-12 w-12 text-cyan-400 mb-6 group-hover:text-purple-400 transition-colors duration-300" />
                <h3 className="text-xl font-bold mb-4 text-white">{tech.name}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Organic wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" fill="rgb(15 23 42)"></path>
          </svg>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/hologram-medical-data.gif"
          alt="Holographic medical data animation"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-black/95" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Core Features
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              className="group p-10 rounded-3xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/60 transition-all duration-500"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-8">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">Health Vault</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Your personal, encrypted health data repository. Import from any healthcare provider, store securely on
                IPFS, and maintain complete ownership of your medical history.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>HL7 FHIR compliance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Immutable audit trail</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group p-10 rounded-3xl bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center mb-8">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">Consent NFTs</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Revolutionary NFT-based consent management. Grant granular access to specific data sets, revoke
                permissions instantly, and maintain full control over who sees what.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Granular permissions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Instant revocation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Time-bound access</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="group p-10 rounded-3xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-500/30 hover:border-green-400/60 transition-all duration-500"
              variants={fadeInUp}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mb-8">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-white">AI Copilot</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Personalized health insights powered by federated learning. Get AI-driven recommendations without
                compromising your privacy or sharing raw data.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Privacy-preserving AI</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Personalized insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Predictive analytics</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Curved mountain divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-28" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120L240,80L480,100L720,60L960,90L1200,40V120Z" fill="rgb(15 23 42)"></path>
          </svg>
        </div>
      </section>

      {/* Code Snippet Section */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/terminal-matrix-animation.gif"
          alt="Terminal matrix animation"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-black/90" />

        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Developer-First API
          </motion.h2>

          <motion.div
            className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
            variants={fadeInUp}
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-4 text-gray-400 text-sm">mediledger-nexus-api</span>
            </div>
            <pre className="text-green-400 text-sm md:text-base overflow-x-auto">
              <code>{`// Initialize MediLedger Nexus SDK
import { MediLedgerNexus } from '@mediledger/nexus-sdk'

const nexus = new MediLedgerNexus({
  network: 'hedera-mainnet',
  privateKey: process.env.PATIENT_PRIVATE_KEY
})

// Upload encrypted health record
const record = await nexus.vault.upload({
  data: encryptedHealthData,
  metadata: {
    type: 'lab-results',
    date: '2024-01-15',
    provider: 'TechHealth Labs'
  }
})

// Create consent NFT for specific access
const consentNFT = await nexus.consent.create({
  recordId: record.id,
  grantee: 'dr-sarah-chen.hcs',
  permissions: ['read', 'analyze'],
  expiresAt: '2024-12-31'
})

// Query AI insights
const insights = await nexus.ai.analyze({
  recordIds: [record.id],
  analysisType: 'risk-assessment'
})

console.log('Health insights:', insights)`}</code>
            </pre>
          </motion.div>
        </motion.div>

        {/* Zigzag divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,120L150,60L300,120L450,60L600,120L750,60L900,120L1050,60L1200,120V120H0Z"
              fill="rgb(0 0 0)"
            ></path>
          </svg>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="relative py-32 bg-black">
        <BackgroundVideo
          src="/biometric-security-animation.gif"
          alt="Biometric security animation"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-slate-900/90" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Security & Compliance
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div variants={fadeInUp}>
              <h3 className="text-3xl font-bold mb-8 text-white">Security Standards</h3>
              <div className="space-y-6">
                {[
                  { standard: "SOC 2 Type II", status: "Certified", color: "green" },
                  { standard: "HIPAA Compliance", status: "Compliant", color: "green" },
                  { standard: "GDPR Ready", status: "Compliant", color: "green" },
                  { standard: "ISO 27001", status: "In Progress", color: "yellow" },
                  { standard: "FedRAMP", status: "Planned", color: "blue" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <span className="text-white font-medium">{item.standard}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.color === "green"
                          ? "bg-green-900/50 text-green-400 border border-green-500/30"
                          : item.color === "yellow"
                            ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                            : "bg-blue-900/50 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="text-3xl font-bold mb-8 text-white">Technical Security</h3>
              <div className="space-y-6">
                {[
                  "End-to-end AES-256 encryption",
                  "Zero-knowledge proof verification",
                  "Multi-signature wallet security",
                  "Immutable audit trails on Hedera",
                  "Federated learning (no data sharing)",
                  "Hardware security module (HSM) support",
                  "Regular penetration testing",
                  "24/7 security monitoring",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Circular arc divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120C400,40 800,40 1200,120V120H0Z" fill="rgb(139 69 19)"></path>
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-r from-purple-900 via-black to-cyan-900">
        <BackgroundVideo
          src="/tech-particles.gif"
          alt="Technology particles animation"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-black/90 to-cyan-900/80" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Ready to Build the Future?
          </motion.h2>

          <motion.p className="text-xl text-gray-300 mb-12" variants={fadeInUp}>
            Join our developer community and start building with MediLedger Nexus APIs.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-6 justify-center" variants={fadeInUp}>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Start Building
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
              >
                View Roadmap
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
