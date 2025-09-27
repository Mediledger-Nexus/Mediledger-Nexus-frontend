"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BackgroundVideo } from "@/components/background-video"
import { User, Building2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/carbon-fiber-dots.gif"
          alt="Carbon fiber texture with subtle dot pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-6 w-full"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div
            className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-10 border border-slate-700/50"
            variants={fadeInUp}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Sign In
              </motion.h1>
              <motion.p className="text-gray-300" variants={fadeInUp}>
                Choose your role to continue
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold">Patient</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Sign in with your phone number</p>
                <Link href="/login/patient">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center mb-3">
                  <Building2 className="h-5 w-5 text-cyan-400 mr-2" />
                  <h3 className="text-lg font-semibold">Organization</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Sign in with your organization email</p>
                <Link href="/login/organization">
                  <Button variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm">
              Need an account? <Link href="/auth" className="text-cyan-400 hover:text-cyan-300">Get started</Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
