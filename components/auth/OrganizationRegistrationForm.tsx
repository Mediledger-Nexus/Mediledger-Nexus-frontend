"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowRight, Loader2, MapPin, User, Phone, Mail } from "lucide-react";

interface OrganizationData {
  organizationName: string;
  organizationType: string;
  registrationNumber: string;
  country: string;
  city: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
}

interface OrganizationRegistrationFormProps {
  onSuccess: (data: OrganizationData) => void;
  onError: (error: string) => void;
  phoneNumber: string;
}

export function OrganizationRegistrationForm({ onSuccess, onError, phoneNumber }: OrganizationRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrganizationData>({
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    country: '',
    city: '',
    adminName: '',
    adminPhone: phoneNumber,
    adminEmail: ''
  });

  const organizationTypes = [
    'Hospital',
    'Clinic',
    'Pharmacy',
    'Laboratory',
    'Diagnostic Center',
    'NGO',
    'Research Institute',
    'Insurance Company',
    'Government Health Agency',
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
    'Other'
  ];

  const handleInputChange = (field: keyof OrganizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.organizationName.trim()) {
      onError('Organization name is required');
      return false;
    }
    
    if (!formData.organizationType) {
      onError('Organization type is required');
      return false;
    }
    
    if (!formData.registrationNumber.trim()) {
      onError('Registration number / License ID is required');
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
    
    if (!formData.adminName.trim()) {
      onError('Admin name is required');
      return false;
    }
    
    if (!formData.adminPhone.trim()) {
      onError('Admin phone is required');
      return false;
    }
    
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      onError('Valid admin email is required');
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
      
      console.log('Organization registration data:', formData);
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
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Organization Registration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Register your healthcare organization for secure data management
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Organization Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName" className="text-white">Organization Name *</Label>
                <Input
                  id="organizationName"
                  placeholder="Enter organization name"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationType" className="text-white">Organization Type *</Label>
                <Select value={formData.organizationType} onValueChange={(value) => handleInputChange('organizationType', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber" className="text-white">Registration Number / License ID *</Label>
              <Input
                id="registrationNumber"
                placeholder="Enter registration or license number"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500">
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
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-t border-slate-700 pt-4">
              <User className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">
                Administrator Details
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="text-white">Admin Name *</Label>
                <Input
                  id="adminName"
                  placeholder="Administrator's full name"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange('adminName', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPhone" className="text-white">Admin Phone *</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.adminPhone}
                  onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
                />
                <p className="text-xs text-gray-500">This phone number was OTP verified</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-white">Admin Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@organization.com"
                value={formData.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Organization...
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
