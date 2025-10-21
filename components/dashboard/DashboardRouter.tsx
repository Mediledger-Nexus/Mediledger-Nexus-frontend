"use client";

import React, { useState } from 'react';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';

interface DashboardRouterProps {
  userRole: 'patient' | 'doctor';
  patientDid: string;
  patientPrivateKey: string;
  doctorDid?: string;
  doctorName?: string;
}

export function DashboardRouter({
  userRole,
  patientDid,
  patientPrivateKey,
  doctorDid,
  doctorName
}: DashboardRouterProps) {
  if (userRole === 'doctor' && doctorDid && doctorName) {
    return (
      <DoctorDashboard
        doctorDid={doctorDid}
        doctorName={doctorName}
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
