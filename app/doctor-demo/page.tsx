"use client";

import React, { useState } from 'react';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';

export default function DoctorDemoPage() {
  const [doctorRole] = useState<'patient' | 'doctor'>('doctor');
  const [doctorDid] = useState('0.0.789012');
  const [doctorName] = useState('Dr. Sarah Johnson');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <DoctorDashboard
        doctorDid={doctorDid}
        doctorName={doctorName}
      />
    </div>
  );
}
