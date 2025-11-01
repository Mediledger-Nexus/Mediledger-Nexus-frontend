"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-slate-800/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            {/* MediLedger Nexus Logo */}
            <div className="w-10 h-10 relative">
              <Image
                src="/mediledger-logo.jpeg"
                alt="MediLedger Nexus Logo"
                width={40}
                height={40}
                className="rounded-lg object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              MediLedger Nexus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/roadmap" className="text-gray-300 hover:text-white transition-colors">
              Roadmap
            </Link>
            <Link href="/doctor-dashboard" className="text-green-400 hover:text-green-300 transition-colors font-medium">
              For Doctors
            </Link>
            <Link href="/hedera-demo" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Hedera Demo
            </Link>
            <Link href="/ai-analysis" className="text-[#00FF9D] hover:text-[#00CC7D] transition-colors font-medium">
              AI Analysis
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">
              Docs
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login/connect">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-slate-800/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/roadmap" className="text-gray-300 hover:text-white transition-colors">
                Roadmap
              </Link>
              <Link href="/doctor-dashboard" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                For Doctors
              </Link>
              <Link href="/hedera-demo" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Hedera Demo
              </Link>
              <Link href="/ai-analysis" className="text-[#00FF9D] hover:text-[#00CC7D] transition-colors font-medium">
                AI Analysis
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                Docs
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-slate-800/50">
                <Link href="/login/connect">
                  <Button variant="ghost" className="w-full text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
