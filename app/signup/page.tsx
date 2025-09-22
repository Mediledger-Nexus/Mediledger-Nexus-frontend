"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Mail, User, Lock, Shield } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { BackgroundVideo } from "@/components/background-video"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  })

  useEffect(() => {
    // Redirect to new auth flow
    router.push('/auth')
  }, [router])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Signup Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <BackgroundVideo
          src="/carbon-fiber-dots.gif"
          alt="Carbon fiber texture with subtle dot pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

        <motion.div
          className="relative z-10 max-w-md mx-auto px-6 w-full"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div
            className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
            variants={fadeInUp}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Join MediLedger Nexus
              </motion.h1>
              <motion.p className="text-gray-300" variants={fadeInUp}>
                Take control of your health data today
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div className="grid grid-cols-2 gap-4" variants={fadeInUp}>
                <div>
                  <Label htmlFor="firstName" className="text-white mb-2 block">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white mb-2 block">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Label htmlFor="email" className="text-white mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Label htmlFor="password" className="text-white mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Label htmlFor="confirmPassword" className="text-white mb-2 block">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              <motion.div className="space-y-4" variants={fadeInUp}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleCheckboxChange("agreeToTerms", checked as boolean)}
                    className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                    I agree to the{" "}
                    <Link href="#" className="text-purple-400 hover:text-purple-300">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-purple-400 hover:text-purple-300">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => handleCheckboxChange("subscribeNewsletter", checked as boolean)}
                    className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                  />
                  <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-300">
                    Subscribe to our newsletter for updates
                  </Label>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                  disabled={!formData.agreeToTerms}
                >
                  Create Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </form>

            <motion.div className="mt-8 text-center" variants={fadeInUp}>
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
