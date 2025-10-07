"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Calendar, Mail, Phone, Shield, ArrowRight, Loader2, UserCheck } from "lucide-react";

interface PatientData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  nationalId: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianWallet?: string;
}

interface PatientRegistrationFormProps {
  onSuccess: (data: PatientData) => void;
  onError: (error: string) => void;
  phoneNumber: string;
}

export function PatientRegistrationForm({ onSuccess, onError, phoneNumber }: PatientRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [needsGuardian, setNeedsGuardian] = useState(false);
  const [formData, setFormData] = useState<PatientData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    nationalId: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianWallet: ''
  });

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, dateOfBirth: date }));
    
    if (date) {
      const age = calculateAge(date);
      const requiresGuardian = age < 18 || age > 60;
      setNeedsGuardian(requiresGuardian);
      
      if (!requiresGuardian) {
        // Clear guardian fields if not needed
        setFormData(prev => ({
          ...prev,
          guardianName: '',
          guardianPhone: '',
          guardianEmail: '',
          guardianWallet: ''
        }));
      }
    }
  };

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      onError('Full name is required');
      return false;
    }
    
    if (!formData.dateOfBirth) {
      onError('Date of birth is required');
      return false;
    }
    
    if (!formData.gender) {
      onError('Gender is required');
      return false;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      onError('Valid email is required');
      return false;
    }

    // National ID is optional only for babies (under 1 year)
    const age = calculateAge(formData.dateOfBirth);
    if (age >= 1 && !formData.nationalId.trim()) {
      onError('National ID / Passport / Hospital ID is required');
      return false;
    }
    
    if (needsGuardian) {
      if (!formData.guardianName?.trim()) {
        onError('Guardian name is required');
        return false;
      }
      
      if (!formData.guardianPhone?.trim()) {
        onError('Guardian phone is required');
        return false;
      }
      
      if (!formData.guardianEmail?.trim() || !formData.guardianEmail.includes('@')) {
        onError('Valid guardian email is required');
        return false;
      }
      
      if (!formData.guardianWallet?.trim()) {
        onError('Guardian wallet is required');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    onError('');
    
    try {
      // Simulate form processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Patient registration data:', formData);
      onSuccess(formData);
    } catch (error) {
      onError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <Card className="w-full max-w-2xl relative z-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Patient Registration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Complete your profile to secure your medical records
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-white">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500"
                />
                {age !== null && (
                  <p className="text-sm text-gray-400">
                    Age: {age} years {needsGuardian && '(Guardian required)'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-purple-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>
            </div>

          </div>

          {/* Guardian Information */}
          {needsGuardian && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-t border-slate-700 pt-4">
                <UserCheck className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  Guardian Information Required
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                {age && age < 18 ? 'Minor patients require guardian details' : 'Elderly patients (60+) require guardian details'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName" className="text-white">Guardian Name *</Label>
                  <Input
                    id="guardianName"
                    placeholder="Guardian's full name"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianPhone" className="text-white">Guardian Phone *</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.guardianPhone}
                    onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail" className="text-white">Guardian Email *</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    placeholder="guardian@email.com"
                    value={formData.guardianEmail}
                    onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianWallet" className="text-white">Guardian Wallet *</Label>
                  <Input
                    id="guardianWallet"
                    placeholder="0.0.123456"
                    value={formData.guardianWallet}
                    onChange={(e) => handleInputChange('guardianWallet', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Patient...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
