"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import Link from "next/link"
import { BackgroundVideo } from "@/components/background-video"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <BackgroundVideo
        src="/placeholder.svg?height=1080&width=1920"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/50 to-black/80" />

      <motion.div
        className="relative z-10 w-full max-w-md mx-auto p-8"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
        }}
      >
        <div className="backdrop-blur-xl bg-slate-900/30 rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400">to the future of healthcare</p>
          </motion.div>

          <motion.form className="space-y-6" variants={fadeInUp}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12"
                  placeholder="Enter your email"
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: email ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl h-12 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: password ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/20"
                />
                <span>Remember me</span>
              </label>
              <Link href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Sign In <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.form>

          <motion.div className="mt-8 text-center" variants={fadeInUp}>
            <p className="text-gray-400">
              {"Don't have an account? "}
              <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </motion.div>

          <motion.div className="mt-6 text-center" variants={fadeInUp}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/30 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-slate-600/50 bg-slate-800/30 text-white hover:bg-slate-700/50 rounded-xl"
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="border-slate-600/50 bg-slate-800/30 text-white hover:bg-slate-700/50 rounded-xl"
              >
                GitHub
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
