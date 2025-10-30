"use client";

import { useState } from "react";
import { RoleSelection } from "./RoleSelection";
import { PhoneLogin } from "./PhoneLogin";
import { PatientRegistrationForm } from "./PatientRegistrationForm";
import { OrganizationRegistrationForm } from "./OrganizationRegistrationForm";
import { DoctorRegistrationForm } from "./DoctorRegistrationForm";
import { WalletConnect } from "./WalletConnect";
import { HederaLogger } from "@/lib/hedera";
import { createSession } from "@/lib/session";
import { createDID } from "@/lib/didRegistry";
import { computeDid } from "@/lib/did";
import { useRouter } from "next/navigation";

type Step = 'role' | 'phone' | 'registration' | 'wallet' | 'complete';
type UserRole = 'patient' | 'organization' | 'doctor';

interface UserData {
  role?: UserRole;
  phoneNumber: string;
  profile?: any;
  walletInfo?: any;
}

export function AuthFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('role');
  const [userData, setUserData] = useState<UserData>({ phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = (role: UserRole) => {
    console.log('Role selected:', role);
    setUserData(prev => ({ ...prev, role }));
    setCurrentStep('phone');
    setError('');
  };

  const handlePhoneSuccess = (user: any) => {
    console.log('Phone verification successful:', user);
    setUserData(prev => ({ 
      ...prev, 
      phoneNumber: user.phoneNumber || user.email || 'demo-user' 
    }));
    setCurrentStep('registration');
    setError('');
  };

  const handleRegistrationSuccess = async (profileData: any) => {
    console.log('Registration successful:', profileData);
    setUserData(prev => ({ ...prev, profile: profileData }));
    
    // Log profile submission to HCS
    try {
      const profileEvent = {
        type: "profile_submitted" as const,
        role: userData.role!,
        phoneNumber: userData.phoneNumber,
        timestamp: new Date().toISOString(),
        ...profileData
      };
      
      await HederaLogger.logRegistration(profileEvent);
      console.log('Profile submission logged to HCS');
    } catch (error) {
      console.error('Error logging profile to HCS:', error);
    }
    
    setCurrentStep('wallet');
    setError('');
  };

  const handleWalletSuccess = async (walletInfo: any) => {
    console.log('💰 AuthFlow - Wallet connection successful:', walletInfo);
    console.log('💰 AuthFlow - Wallet account ID:', walletInfo.accountId);
    console.log('💰 AuthFlow - Wallet public key:', walletInfo.publicKey);
    console.log('💰 AuthFlow - Wallet type:', walletInfo.type);

    setUserData(prev => ({ ...prev, walletInfo }));

    setLoading(true);
    try {
      // Log wallet linked event to HCS
      const walletLinkEvent = {
        type: "wallet_linked" as const,
        walletId: walletInfo.accountId,
        role: userData.role!,
        timestamp: new Date().toISOString()
      };

      await HederaLogger.logRegistration(walletLinkEvent);
      console.log('✅ AuthFlow - Wallet link logged to HCS');

      // Log registration completion event to HCS
      const completionEvent = {
        type: "registration_complete" as const,
        walletId: walletInfo.accountId,
        role: userData.role!,
        phoneNumber: userData.phoneNumber,
        timestamp: new Date().toISOString(),
        ...(userData.role === 'patient' ? {
          dob: userData.profile?.dateOfBirth,
          gender: userData.profile?.gender,
          email: userData.profile?.email,
          guardianWallet: userData.profile?.guardianWallet
        } : {
          orgType: userData.profile?.organizationType,
          country: userData.profile?.country,
          city: userData.profile?.city,
          adminEmail: userData.profile?.adminEmail
        })
      };

      await HederaLogger.logRegistration(completionEvent);
      console.log('✅ AuthFlow - Registration completion logged to HCS');

      // Create DID for the user
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
      const publicKey = walletInfo.publicKey || 'demo-public-key';

      const didDocument = await createDID(
        walletInfo.accountId,
        publicKey,
        userData.role!,
        userData.profile,
        network
      );

      console.log('🔗 AuthFlow - DID created:', didDocument.id);

      // Create session with DID
      const sessionData = {
        walletId: walletInfo.accountId,
        role: userData.role!,
        phoneNumber: userData.phoneNumber,
        profile: userData.profile,
        walletType: walletInfo.type,
        did: didDocument.id,
        network: network
      };

      console.log('📦 AuthFlow - Creating session with data:', sessionData);
      const token = await createSession(sessionData);
      console.log('✅ AuthFlow - Session created successfully, token:', token?.substring(0, 50) + '...');

      setCurrentStep('complete');

      // Redirect to appropriate dashboard after a short delay
      setTimeout(() => {
        console.log('🚀 AuthFlow - Redirecting to dashboard for role:', userData.role);
        if (userData.role === 'doctor') {
          router.push('/doctor-dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ AuthFlow - Error completing registration:', error);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Progress indicator helpers
  const stepIndex: Record<Step, number> = {
    role: 0,
    phone: 1,
    registration: 2,
    wallet: 3,
    complete: 4,
  };
  const currentIdx = stepIndex[currentStep];
  const dotClass = (idx: number) =>
    idx === currentIdx
      ? 'bg-purple-400'
      : idx < currentIdx
      ? 'bg-green-400'
      : 'bg-gray-600';

  return (
    <div className="min-h-screen bg-black">
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Progress Indicator */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
          <div className={`w-2 h-2 rounded-full ${dotClass(0)}`} />
          <div className={`w-2 h-2 rounded-full ${dotClass(1)}`} />
          <div className={`w-2 h-2 rounded-full ${dotClass(2)}`} />
          <div className={`w-2 h-2 rounded-full ${dotClass(3)}`} />
        </div>
      </div>

      {currentStep === 'role' && (
        <RoleSelection 
          onRoleSelect={handleRoleSelection}
        />
      )}

      {currentStep === 'phone' && (
        <PhoneLogin 
          onSuccess={handlePhoneSuccess}
          onError={handleError}
        />
      )}

      {currentStep === 'registration' && userData.role === 'patient' && (
        <PatientRegistrationForm 
          onSuccess={handleRegistrationSuccess}
          onError={handleError}
          phoneNumber={userData.phoneNumber}
        />
      )}

      {currentStep === 'registration' && userData.role === 'organization' && (
        <OrganizationRegistrationForm 
          onSuccess={handleRegistrationSuccess}
          onError={handleError}
          phoneNumber={userData.phoneNumber}
        />
      )}

      {currentStep === 'registration' && userData.role === 'doctor' && (
        <DoctorRegistrationForm 
          onSuccess={handleRegistrationSuccess}
          onError={handleError}
          phoneNumber={userData.phoneNumber}
        />
      )}

      {currentStep === 'wallet' && (
        <WalletConnect 
          onSuccess={handleWalletSuccess}
          onError={handleError}
        />
      )}

      {currentStep === 'complete' && (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">
                {userData.role === 'patient' ? 'Patient' : userData.role === 'doctor' ? 'Doctor' : 'Organization'} Registration Complete!
              </h2>
              <p className="text-gray-400 mb-4">Your account has been created and logged to the blockchain.</p>
            </div>

            {/* DID Registration Success Message */}
            {userData.walletInfo?.did && (
              <div className="bg-slate-900/50 border border-cyan-500/50 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                      ✅ DID Successfully Registered on Hedera {(process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toUpperCase()}!
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Your Decentralized Identifier has been registered on the Hedera blockchain, proving your identity on-chain.
                    </p>
                    <div className="bg-slate-800/50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-1">Your DID:</p>
                      <p className="text-sm font-mono text-cyan-300 break-all">{userData.walletInfo.did}</p>
                    </div>
                    {sessionStorage.getItem('didRegistrationTx') && (() => {
                      const txData = JSON.parse(sessionStorage.getItem('didRegistrationTx') || '{}');
                      return (
                        <a
                          href={txData.hashScanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                          <span>View transaction on HashScan</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {loading && <p className="text-sm text-gray-500 text-center">Redirecting to dashboard...</p>}
          </div>
        </div>
      )}
    </div>
  );
}
