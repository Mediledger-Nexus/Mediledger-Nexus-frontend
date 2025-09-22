"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, Users, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RegistrationData {
  fullName: string;
  dateOfBirth: Date | null;
  gender: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  guardianWallet: string;
}

interface RegistrationFormProps {
  phoneNumber: string;
  onSuccess: (data: RegistrationData) => void;
  onError: (error: string) => void;
}

export function RegistrationForm({ phoneNumber, onSuccess, onError }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    dateOfBirth: null,
    gender: '',
    email: '',
    guardianName: '',
    guardianPhone: '',
    guardianWallet: ''
  });
  const [loading, setLoading] = useState(false);
  const [guardianRequired, setGuardianRequired] = useState(false);
  const [guardianRecommended, setGuardianRecommended] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const age = calculateAge(date);
      setFormData(prev => ({ ...prev, dateOfBirth: date }));
      
      // Guardian logic based on age
      if (age < 18) {
        setGuardianRequired(true);
        setGuardianRecommended(false);
      } else if (age > 60) {
        setGuardianRequired(false);
        setGuardianRecommended(true);
      } else {
        setGuardianRequired(false);
        setGuardianRecommended(false);
      }
    }
    setDatePickerOpen(false);
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return 'Full name is required';
    }
    if (!formData.dateOfBirth) {
      return 'Date of birth is required';
    }
    if (guardianRequired && !formData.guardianName.trim()) {
      return 'Guardian name is required for users under 18';
    }
    if (guardianRequired && !formData.guardianPhone.trim()) {
      return 'Guardian phone is required for users under 18';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      onError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Simulate form processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess(formData);
    } catch (error: any) {
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
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set up your MediLedger Nexus account for {phoneNumber}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-white">
              Date of Birth <span className="text-red-400">*</span>
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50",
                    !formData.dateOfBirth && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth || undefined}
                  onSelect={handleDateChange}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
            {age !== null && (
              <p className="text-sm text-gray-400">Age: {age} years</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-white">Gender (Optional)</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="male" className="text-white">Male</SelectItem>
                <SelectItem value="female" className="text-white">Female</SelectItem>
                <SelectItem value="other" className="text-white">Other</SelectItem>
                <SelectItem value="prefer-not-to-say" className="text-white">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            />
          </div>

          {/* Guardian Information */}
          {(guardianRequired || guardianRecommended) && (
            <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <Label className="text-white font-semibold">
                  Guardian Information
                  {guardianRequired && <span className="text-red-400 ml-1">*</span>}
                  {guardianRecommended && <span className="text-yellow-400 ml-1">(Recommended)</span>}
                </Label>
              </div>
              
              {guardianRequired && (
                <div className="flex items-start space-x-2 text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>Guardian information is required for users under 18 years old.</p>
                </div>
              )}

              {guardianRecommended && (
                <div className="flex items-start space-x-2 text-sm text-blue-400 bg-blue-400/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>Guardian information is recommended for users over 60 years old.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName" className="text-white">
                    Guardian Name {guardianRequired && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="guardianName"
                    placeholder="Guardian's full name"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianPhone" className="text-white">
                    Guardian Phone {guardianRequired && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.guardianPhone}
                    onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianWallet" className="text-white">Guardian Wallet (Optional)</Label>
                <Input
                  id="guardianWallet"
                  placeholder="Guardian's Hedera wallet address"
                  value={formData.guardianWallet}
                  onChange={(e) => handleInputChange('guardianWallet', e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
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
                Creating Profile...
              </>
            ) : (
              <>
                Continue to Wallet Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
