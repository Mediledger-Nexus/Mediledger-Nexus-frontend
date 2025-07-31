"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar, Users, TrendingUp, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BackgroundVideo } from "@/components/background-video"
import { useState, useEffect } from "react"

export default function RoadmapPage() {
  const [counts, setCounts] = useState({
    patients: 0,
    providers: 0,
    records: 0,
    countries: 0,
  })

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

  // Animated counters
  useEffect(() => {
    const targets = { patients: 50000, providers: 1200, records: 2500000, countries: 15 }
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      setCounts({
        patients: Math.floor(targets.patients * progress),
        providers: Math.floor(targets.providers * progress),
        records: Math.floor(targets.records * progress),
        countries: Math.floor(targets.countries * progress),
      })

      if (step >= steps) {
        clearInterval(timer)
        setCounts(targets)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Roadmap Timeline Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/placeholder.svg?height=1080&width=1920"
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
            Our Roadmap
          </motion.h1>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500"></div>

            <div className="space-y-16">
              {[
                {
                  phase: "Phase 1",
                  period: "Q1 2024",
                  title: "Foundation & MVP",
                  status: "Completed",
                  color: "green",
                  items: [
                    "Core Hedera integration",
                    "Basic health vault functionality",
                    "HL7 FHIR compliance",
                    "Initial security audit",
                  ],
                },
                {
                  phase: "Phase 2",
                  period: "Q2 2024",
                  title: "Advanced Features",
                  status: "In Progress",
                  color: "yellow",
                  items: ["zk-SNARK implementation", "Consent NFT system", "IPFS integration", "Developer API beta"],
                },
                {
                  phase: "Phase 3",
                  period: "Q3 2024",
                  title: "AI & Analytics",
                  status: "Planned",
                  color: "blue",
                  items: [
                    "Federated learning framework",
                    "AI copilot features",
                    "Predictive analytics",
                    "Mobile applications",
                  ],
                },
                {
                  phase: "Phase 4",
                  period: "Q4 2024",
                  title: "Enterprise & Scale",
                  status: "Planned",
                  color: "purple",
                  items: ["Enterprise partnerships", "Multi-chain support", "Global compliance", "Advanced governance"],
                },
              ].map((phase, index) => (
                <motion.div key={index} className="relative flex items-start space-x-8" variants={fadeInUp}>
                  <div
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                      phase.color === "green"
                        ? "bg-green-600"
                        : phase.color === "yellow"
                          ? "bg-yellow-600"
                          : phase.color === "blue"
                            ? "bg-blue-600"
                            : "bg-purple-600"
                    } shadow-lg`}
                  >
                    <Calendar className="h-8 w-8 text-white" />
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-2xl font-bold text-white">{phase.phase}</h3>
                      <span className="text-gray-400">{phase.period}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          phase.color === "green"
                            ? "bg-green-900/50 text-green-400 border border-green-500/30"
                            : phase.color === "yellow"
                              ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                              : phase.color === "blue"
                                ? "bg-blue-900/50 text-blue-400 border border-blue-500/30"
                                : "bg-purple-900/50 text-purple-400 border border-purple-500/30"
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-cyan-400 mb-4">{phase.title}</h4>
                    <ul className="space-y-2">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-3 text-gray-300">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Metrics Section */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/placeholder.svg?height=1080&width=1920"
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
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Impact Metrics
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "Patients Served", value: counts.patients.toLocaleString(), suffix: "+" },
              { icon: Shield, label: "Healthcare Providers", value: counts.providers.toLocaleString(), suffix: "+" },
              { icon: TrendingUp, label: "Medical Records", value: counts.records.toLocaleString(), suffix: "+" },
              { icon: Globe, label: "Countries", value: counts.countries.toString(), suffix: "" },
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50"
                variants={fadeInUp}
              >
                <metric.icon className="h-12 w-12 text-cyan-400 mx-auto mb-6" />
                <div className="text-4xl font-bold text-white mb-2">
                  {metric.value}
                  {metric.suffix}
                </div>
                <div className="text-gray-400">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stakeholder Benefits Section */}
      <section className="relative py-32">
        <BackgroundVideo
          src="/placeholder.svg?height=1080&width=1920"
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
            Stakeholder Benefits
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm border border-blue-500/30"
              variants={fadeInUp}
            >
              <Users className="h-12 w-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-6 text-white">For Patients</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Complete ownership and control of health data</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Seamless data portability between providers</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>AI-powered personalized health insights</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Enhanced privacy and security</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-500/30"
              variants={fadeInUp}
            >
              <Shield className="h-12 w-12 text-green-400 mb-6" />
              <h3 className="text-2xl font-bold mb-6 text-white">For Providers</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Instant access to complete patient history</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Reduced administrative overhead</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Enhanced clinical decision support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Improved patient outcomes</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30"
              variants={fadeInUp}
            >
              <TrendingUp className="h-12 w-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-6 text-white">For Researchers</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Privacy-preserving access to large datasets</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Accelerated clinical research timelines</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Enhanced data quality and completeness</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Federated learning capabilities</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <BackgroundVideo
          src="/placeholder.svg?height=1080&width=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-black/90 to-pink-900/80" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Power the Future of Healthcare
          </motion.h2>

          <motion.p className="text-xl text-gray-300 mb-12" variants={fadeInUp}>
            Join us in revolutionizing healthcare data ownership and privacy. Be part of the decentralized healthcare
            movement.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-6 justify-center" variants={fadeInUp}>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Join the Revolution <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/features">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-12 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
              >
                Explore Technology
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 bg-black border-t border-slate-800">
        <BackgroundVideo
          src="/placeholder.svg?height=400&width=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">MediLedger Nexus</h3>
              <p className="text-gray-400">Decentralized healthcare data ownership for the future.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-cyan-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="hover:text-cyan-400 transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-cyan-400 transition-colors">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediLedger Nexus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
