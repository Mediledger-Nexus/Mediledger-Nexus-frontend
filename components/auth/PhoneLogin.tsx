"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, Shield, ArrowRight, Loader2, Mail } from "lucide-react";
import { auth } from "@/lib/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

interface PhoneLoginProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export function PhoneLogin({ onSuccess, onError }: PhoneLoginProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'fallback'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [useFallback, setUseFallback] = useState(false);


  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            onError('reCAPTCHA expired. Please try again.');
          }
        });
        setRecaptchaVerifier(verifier);
        return verifier;
      } catch (error) {
        console.error('Error setting up reCAPTCHA:', error);
        throw error;
      }
    }
    return recaptchaVerifier;
  };

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      onError('Please enter a phone number');
      return;
    }

    setLoading(true);
    onError('');
    console.log('Demo OTP process for hackathon - phone:', phoneNumber);

    // Demo mode for hackathon - simulate OTP sending
    setTimeout(() => {
      console.log('Demo OTP sent - use code: 123456');
      setStep('otp');
      setLoading(false);
      onError(''); // Clear any previous errors
    }, 1500); // Simulate network delay
  };

  const verifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      onError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    console.log('Demo OTP verification - entered code:', otp);

    // Demo mode for hackathon - accept 123456
    setTimeout(() => {
      if (otp === '123456') {
        console.log('Demo OTP verified successfully');
        // Create a mock user object for demo
        const mockUser = {
          uid: `demo-${Date.now()}`,
          phoneNumber: phoneNumber,
          isDemo: true
        };
        onSuccess(mockUser);
      } else {
        onError('Invalid OTP. Please use demo code: 123456');
      }
      setLoading(false);
    }, 1000); // Simulate verification delay
  };

  const handleFallbackAuth = async () => {
    if (!email.trim() || !password.trim()) {
      onError('Please enter both email and password');
      return;
    }

    setLoading(true);
    onError('');

    try {
      // Try to sign in first
      let result;
      try {
        result = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        // If user doesn't exist, create account
        if (signInError.code === 'auth/user-not-found') {
          result = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInError;
        }
      }
      
      onSuccess(result.user);
    } catch (error: any) {
      console.error('Error with fallback auth:', error);
      onError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <Card className="w-full max-w-md relative z-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
            {step === 'phone' ? (
              <Phone className="h-8 w-8 text-white" />
            ) : step === 'otp' ? (
              <Shield className="h-8 w-8 text-white" />
            ) : (
              <Mail className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {step === 'phone' ? 'Phone Verification' : step === 'otp' ? 'Enter OTP' : 'Email Authentication'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {step === 'phone' 
              ? 'Enter your phone number for demo verification'
              : step === 'otp'
              ? `Demo OTP sent to ${phoneNumber}. Use code: 123456`
              : 'Phone verification unavailable. Please use email to continue.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={sendOTP}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setUseFallback(true);
                    setStep('fallback');
                  }}
                  className="w-full border-slate-600 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400"
                >
                  Use Email Instead
                </Button>
              </div>
            </>
          ) : step === 'otp' ? (
            <>
              <div className="space-y-4">
                <Label className="text-white text-center block">Enter 6-digit code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="bg-slate-800/50 border-slate-600 text-white" />
                      <InputOTPSlot index={1} className="bg-slate-800/50 border-slate-600 text-white" />
                      <InputOTPSlot index={2} className="bg-slate-800/50 border-slate-600 text-white" />
                      <InputOTPSlot index={3} className="bg-slate-800/50 border-slate-600 text-white" />
                      <InputOTPSlot index={4} className="bg-slate-800/50 border-slate-600 text-white" />
                      <InputOTPSlot index={5} className="bg-slate-800/50 border-slate-600 text-white" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={verifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setConfirmationResult(null);
                  }}
                  className="w-full border-slate-600 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400"
                >
                  Change Phone Number
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleFallbackAuth}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('phone');
                    setUseFallback(false);
                    setEmail('');
                    setPassword('');
                  }}
                  className="w-full border-slate-600 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400"
                >
                  Try Phone Again
                </Button>
              </div>
            </>
          )}

          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  );
}
