"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { BackgroundVideo } from "@/components/background-video"
import { useState } from "react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
    { text: "Contains special character", met: /[!@#$%^&*]/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      <BackgroundVideo
        src="/placeholder.svg?height=1080&width=1920"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-cyan-900/50 to-black/80" />

      <motion.div
        className="relative z-10 w-full max-w-lg mx-auto p-8"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
        }}
      >
        <div className="backdrop-blur-xl bg-slate-900/30 rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Join the Future
            </h1>
            <p className="text-gray-400">Create your MediLedger Nexus account</p>
          </motion.div>

          <motion.form className="space-y-6" variants={fadeInUp}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl h-12"
                    placeholder="John"
                  />
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: formData.firstName ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl h-12"
                    placeholder="Doe"
                  />
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: formData.lastName ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl h-12"
                  placeholder="john@example.com"
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: formData.email ? 1 : 0 }}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl h-12 pr-12"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: formData.password ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {formData.password && (
                <motion.div
                  className="mt-3 space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? "bg-green-500" : "bg-slate-600"
                        }`}
                      >
                        {req.met && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={req.met ? "text-green-400" : "text-gray-400"}>{req.text}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl h-12 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: formData.confirmPassword ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-sm">Passwords do not match</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                />
                <span>
                  I agree to the{" "}
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label className="flex items-start space-x-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                />
                <span>I want to receive updates about MediLedger Nexus</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white h-12 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Create Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.form>

          <motion.div className="mt-8 text-center" variants={fadeInUp}>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>

          <motion.div className="mt-6 text-center" variants={fadeInUp}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900/30 text-gray-400">Or sign up with</span>
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
