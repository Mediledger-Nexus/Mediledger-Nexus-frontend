"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BackgroundVideo } from "@/components/background-video"

export default function RoadmapPage() {
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

  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "Foundation & Core Infrastructure",
      status: "completed",
      date: "Q1 2025",
      items: [
        "Hedera Hashgraph integration",
        "IPFS storage implementation",
        "Basic encryption protocols",
        "HL7 FHIR compliance framework",
      ],
    },
    {
      phase: "Phase 2",
      title: "Privacy & Security Layer",
      status: "completed",
      date: "Q2 2025",
      items: [
        "Zero-knowledge proof implementation",
        "Advanced encryption (AES-256)",
        "Multi-signature wallet support",
        "Security audit completion",
      ],
    },
    {
      phase: "Phase 3",
      title: "Consent Management & NFTs",
      status: "in-progress",
      date: "Q3 2025",
      items: [
        "NFT-based consent tokens",
        "Granular permission system",
        "Instant revocation mechanism",
        "Time-bound access controls",
      ],
    },
    {
      phase: "Phase 4",
      title: "AI & Analytics Engine",
      status: "planned",
      date: "Q4 2025",
      items: [
        "Federated learning implementation",
        "Privacy-preserving AI models",
        "Predictive health analytics",
        "Personalized insights engine",
      ],
    },
    {
      phase: "Phase 5",
      title: "Developer Ecosystem",
      status: "planned",
      date: "Q1 2025",
      items: ["Public API release", "SDK development", "Developer documentation", "Community tools & resources"],
    },
    {
      phase: "Phase 6",
      title: "Enterprise & Scale",
      status: "planned",
      date: "Q2 2025/2026",
      items: [
        "Enterprise partnerships",
        "Healthcare system integrations",
        "Global compliance certifications",
        "Performance optimization",
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case "in-progress":
        return <Clock className="h-6 w-6 text-yellow-400" />
      default:
        return <Circle className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500/50 bg-green-900/20"
      case "in-progress":
        return "border-yellow-500/50 bg-yellow-900/20"
      default:
        return "border-gray-500/50 bg-gray-900/20"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/timeline-particle-flow.gif"
          alt="Timeline with flowing particles animation"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-6 text-center"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Our Roadmap
          </motion.h1>

          <motion.p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto" variants={fadeInUp}>
            Building the future of healthcare data ownership, one milestone at a time.
          </motion.p>
        </motion.div>

        {/* Curved wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="rgb(15 23 42)"
            ></path>
          </svg>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/graph-data-visualization.gif"
          alt="Animated graphs and charts visualization"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/95" />

        <motion.div
          className="relative z-10 max-w-6xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Development Timeline
          </motion.h2>

          <div className="space-y-12">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-2xl border backdrop-blur-sm ${getStatusColor(item.status)}`}
                variants={fadeInUp}
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.phase}</h3>
                        <h4 className="text-xl text-gray-300 mb-2">{item.title}</h4>
                      </div>
                      <div className="text-sm text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full">{item.date}</div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {item.items.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Triangular divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120L600,0L1200,120Z" fill="rgb(0 0 0)"></path>
          </svg>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="relative py-32 bg-black">
        <BackgroundVideo
          src="/graph-data-visualization.gif"
          alt="Animated graphs and charts visualization"
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
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Key Metrics & Goals
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                metric: "1M+",
                label: "Patient Records",
                desc: "Secure health records by 2025",
                color: "from-purple-600 to-pink-600",
              },
              {
                metric: "99.9%",
                label: "Uptime SLA",
                desc: "Enterprise-grade reliability",
                color: "from-cyan-600 to-blue-600",
              },
              {
                metric: "50+",
                label: "Healthcare Partners",
                desc: "Integrated health systems",
                color: "from-green-600 to-emerald-600",
              },
              {
                metric: "100%",
                label: "HIPAA Compliant",
                desc: "Full regulatory compliance",
                color: "from-orange-600 to-red-600",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50"
                variants={fadeInUp}
              >
                <div
                  className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
                >
                  {item.metric}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.label}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="rgb(15 23 42)"
            ></path>
          </svg>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/identity-nodes-map.gif"
          alt="Identity nodes network map visualization"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/95" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Key Stakeholders
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Patients",
                desc: "Own and control their medical data with unprecedented privacy and security.",
                benefits: ["Data ownership", "Privacy control", "Portable records", "AI insights"],
                color: "from-purple-900/30 to-pink-900/30",
                border: "border-purple-500/30",
              },
              {
                title: "Healthcare Providers",
                desc: "Access comprehensive patient data with proper consent and compliance.",
                benefits: ["Complete patient history", "Interoperability", "Reduced admin", "Better outcomes"],
                color: "from-cyan-900/30 to-blue-900/30",
                border: "border-cyan-500/30",
              },
              {
                title: "Developers",
                desc: "Build innovative healthcare applications using our secure, compliant APIs.",
                benefits: ["Robust APIs", "SDK support", "Documentation", "Community"],
                color: "from-green-900/30 to-emerald-900/30",
                border: "border-green-500/30",
              },
            ].map((stakeholder, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-2xl bg-gradient-to-br ${stakeholder.color} backdrop-blur-sm border ${stakeholder.border} hover:border-opacity-60 transition-all duration-500`}
                variants={fadeInUp}
              >
                <h3 className="text-2xl font-bold mb-4 text-white">{stakeholder.title}</h3>
                <p className="text-gray-300 mb-6">{stakeholder.desc}</p>
                <ul className="space-y-2">
                  {stakeholder.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-400">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hexagon divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120L200,60L400,120L600,60L800,120L1000,60L1200,120V120H0Z" fill="rgb(139 69 19)"></path>
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-r from-purple-900 via-black to-cyan-900">
        <BackgroundVideo
          src="/energetic-orbiting-spheres.gif"
          alt="High energy orbiting spheres animation"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
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
            Join Our Journey
          </motion.h2>

          <motion.p className="text-xl text-gray-300 mb-12" variants={fadeInUp}>
            Be part of the healthcare revolution. Help us build the future of patient-controlled medical data.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-6 justify-center" variants={fadeInUp}>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Early Access <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
              >
                Explore Features
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
