"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, ArrowRight, Loader2, User, Phone, Mail, Shield, Building } from "lucide-react";

interface DoctorData {
  fullName: string;
  licenseNumber: string;
  specialization: string;
  hospital: string;
  email: string;
  phone: string;
  experience: string;
  country: string;
  city: string;
  verificationStatus: 'pending';
}

interface DoctorRegistrationFormProps {
  onSuccess: (data: DoctorData) => void;
  onError: (error: string) => void;
  phoneNumber: string;
}

export function DoctorRegistrationForm({ onSuccess, onError, phoneNumber }: DoctorRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DoctorData>({
    fullName: '',
    licenseNumber: '',
    specialization: '',
    hospital: '',
    email: '',
    phone: phoneNumber,
    experience: '',
    country: '',
    city: '',
    verificationStatus: 'pending'
  });

  const specializations = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Oncology',
    'Psychiatry',
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Radiology',
    'Anesthesiology',
    'Pathology',
    'Other'
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Australia',
    'India',
    'Singapore',
    'Japan',
    'Nigeria',
    'Kenya',
    'South Africa',
    'Other'
  ];

  const experienceLevels = [
    'Resident (0-3 years)',
    'Junior Doctor (3-7 years)',
    'Senior Doctor (7-15 years)',
    'Consultant (15+ years)',
    'Specialist'
  ];

  const handleInputChange = (field: keyof DoctorData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      onError('Full name is required');
      return false;
    }
    
    if (!formData.licenseNumber.trim()) {
      onError('Medical license number is required');
      return false;
    }
    
    if (!formData.specialization) {
      onError('Medical specialization is required');
      return false;
    }
    
    if (!formData.hospital.trim()) {
      onError('Hospital or clinic name is required');
      return false;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      onError('Valid email is required');
      return false;
    }
    
    if (!formData.experience) {
      onError('Experience level is required');
      return false;
    }
    
    if (!formData.country) {
      onError('Country is required');
      return false;
    }
    
    if (!formData.city.trim()) {
      onError('City is required');
      return false;
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
      
      console.log('Doctor registration data:', formData);
      onSuccess(formData);
    } catch (error) {
      onError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <Card className="w-full max-w-2xl relative z-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Doctor Registration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Register as a verified healthcare provider on MediLedger Nexus
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Your Full Name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber" className="text-white">Medical License Number *</Label>
                <Input
                  id="licenseNumber"
                  placeholder="MD-12345 or License ID"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization" className="text-white">Medical Specialization *</Label>
                <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-green-500">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec.toLowerCase().replace(' ', '-')}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-white">Experience Level *</Label>
                <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-green-500">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level.toLowerCase().replace(' ', '-')}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-white">Hospital/Clinic Name *</Label>
              <Input
                id="hospital"
                placeholder="Your current hospital or clinic"
                value={formData.hospital}
                onChange={(e) => handleInputChange('hospital', e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-t border-slate-700 pt-4">
              <Phone className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">
                Contact Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Professional Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-green-500"
                />
                <p className="text-xs text-gray-500">This phone number was OTP verified</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-green-500">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country.toLowerCase().replace(' ', '-')}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-white">City *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-green-400 font-semibold mb-1">Verification Process</h4>
                <p className="text-gray-300 text-sm">
                  Your registration will be verified within 24-48 hours. You'll receive a notification once your doctor profile is approved and your DID is created.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Doctor...
              </>
            ) : (
              <>
                Complete Doctor Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
