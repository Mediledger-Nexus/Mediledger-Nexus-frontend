"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Users, Database, Brain, Play } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BackgroundVideo } from "@/components/background-video"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SessionManager } from "@/lib/session"

export default function HomePage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userSession = SessionManager.getSession()
    if (userSession && SessionManager.isAuthenticated()) {
      // Check if user has doctor-like credentials AND is actually a doctor
      if ((userSession.walletId || userSession.did) && userSession.role === 'doctor') {
        router.push('/doctor-dashboard')
        return
      }
      router.push('/dashboard')
      return
    }
    setSession(userSession)
    setLoading(false)
  }, [router])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <BackgroundVideo
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-animation-W7GdIl2gAgSUgYoXWR6xFDcwPA9WSB.mp4"
          alt="Hero animation with medical data visualization"
          className="absolute inset-0 w-full h-full object-cover"
          isVideo={true}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight"
            variants={fadeInUp}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Your Records.
            <br />
            Your Control.
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            The future of healthcare is decentralized. Own your medical data, control access, and unlock personalized
            AI-driven insights with MediLedger Nexus.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-6 justify-center items-center" variants={fadeInUp}>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/70 text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>
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

      {/* Why It's Groundbreaking Section */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/encrypted-data-flow.gif"
          alt="Encrypted data visualization animation"
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
            Why It's Groundbreaking
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Zero-Knowledge Privacy",
                desc: "Your medical data stays encrypted and private, even from us. zk-SNARKs ensure verification without exposure.",
              },
              {
                icon: Zap,
                title: "Instant Interoperability",
                desc: "HL7 FHIR compliance means seamless integration with any healthcare system, anywhere in the world.",
              },
              {
                icon: Users,
                title: "Patient-Controlled Access",
                desc: "Grant and revoke access to your data instantly with NFT-based consent management.",
              },
              {
                icon: Database,
                title: "Immutable Records",
                desc: "Hedera Hashgraph ensures your medical history is tamper-proof and permanently accessible.",
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                desc: "Federated learning provides personalized health insights without compromising your privacy.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
                variants={fadeInUp}
              >
                <feature.icon className="h-12 w-12 text-cyan-400 mb-6 group-hover:text-purple-400 transition-colors duration-300" />
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
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

      {/* Problem vs Solution Section */}
      <section className="relative py-32 bg-black">
        <BackgroundVideo
          src="/hospital-digital-transformation.gif"
          alt="Hospital digital transformation animation"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-black/90 to-green-900/80" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeInUp} className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-red-400 mb-8">The Problem</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Medical records scattered across incompatible systems</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Patients have no control over their own health data</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Data breaches expose millions of sensitive records annually</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">AI insights limited by data silos and privacy concerns</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-green-400 mb-8">Our Solution</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Unified, interoperable health records on Hedera</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Patient-owned data with granular access control</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Zero-knowledge proofs ensure privacy-preserving verification</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300 text-lg">Federated AI delivers insights without data exposure</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Curved diagonal divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-28" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,120C300,60 600,0 1200,40V120Z" fill="rgb(15 23 42)"></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 bg-slate-900">
        <BackgroundVideo
          src="/data-flow-systems.gif"
          alt="Data flow through systems animation"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
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
            How It Works
          </motion.h2>

          <div className="space-y-16">
            {[
              {
                step: "01",
                title: "Connect Your Records",
                desc: "Securely import medical data from any HL7 FHIR-compliant system",
              },
              {
                step: "02",
                title: "Encrypt & Store",
                desc: "Data is encrypted with your private key and stored on IPFS with Hedera consensus",
              },
              {
                step: "03",
                title: "Control Access",
                desc: "Issue NFT-based consent tokens to grant specific access to healthcare providers",
              },
              {
                step: "04",
                title: "AI Insights",
                desc: "Federated learning algorithms analyze your data locally to provide personalized insights",
              },
            ].map((item, index) => (
              <motion.div key={index} className="flex items-center space-x-8 group" variants={fadeInUp}>
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="rgb(0 0 0)"
            ></path>
          </svg>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 bg-black">
        <BackgroundVideo
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AQNUbx0mAJ7e4HqGLAx5PA4rmfSg58aHM2x1QHvrx-2J1eLmRA38K5yN4DjY82rIpoJQQOOikhM9-2YEt4QLmYl2RvmPsR-7FSm9I16RUZuQT2bHDl8621E0ZHj06iQt-njC5BjUIF9vwT3e0ypZ3XpFot8VjAX.mp4"
          alt="Testimonials background animation"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          isVideo={true}
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
            className="text-5xl md:text-6xl font-bold text-center mb-20 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Trusted by Healthcare Leaders
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Chen",
                role: "Chief Medical Officer, TechHealth",
                quote: "MediLedger Nexus represents the future of patient-controlled healthcare data.",
              },
              {
                name: "Michael Rodriguez",
                role: "CTO, HealthTech Solutions",
                quote: "The zero-knowledge privacy features are exactly what our industry needs.",
              },
              {
                name: "Dr. Aisha Patel",
                role: "Director of Digital Health, MedCenter",
                quote: "Finally, a solution that puts patients in control of their own medical records.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50"
                variants={fadeInUp}
              >
                <p className="text-gray-300 text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.name}</p>
                  <p className="text-cyan-400">{testimonial.role}</p>
                </div>
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
          src="/orbiting-spheres.gif"
          alt="Energetic orbiting spheres animation"
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
            Ready to Own Your Health Data?
          </motion.h2>

          <motion.p className="text-xl text-gray-300 mb-12" variants={fadeInUp}>
            Join the healthcare revolution. Take control of your medical records today.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-6 justify-center" variants={fadeInUp}>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
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
