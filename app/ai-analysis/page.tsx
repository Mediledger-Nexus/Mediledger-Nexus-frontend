"use client"

import React from 'react'
import { Navigation } from '@/components/navigation'
import { PatientForm } from '@/components/patient-form'
import DemoBanner from '@/components/demo-banner'

export default function AIAnalysisPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <DemoBanner />
      
      {/* AI Analysis Section */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-black">
        <PatientForm />
      </section>
    </div>
  )
} 