"use client";

import React, { useState } from 'react';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';

interface DashboardRouterProps {
  userRole: 'patient' | 'doctor';
  patientDid: string;
  patientPrivateKey: string;
  doctorDid?: string;
  doctorPrivateKey?: string;
}

export function DashboardRouter({
  userRole,
  patientDid,
  patientPrivateKey,
  doctorDid,
  doctorPrivateKey
}: DashboardRouterProps) {
  if (userRole === 'doctor' && doctorDid && doctorPrivateKey) {
    return (
      <DoctorDashboard
        doctorDid={doctorDid}
        doctorPrivateKey={doctorPrivateKey}
      />
    );
  }

  return (
    <PatientDashboard
      patientDid={patientDid}
      patientPrivateKey={patientPrivateKey}
    />
  );
}

export default DashboardRouter;
