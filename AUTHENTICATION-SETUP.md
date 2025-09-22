# MediLedger Nexus Authentication Setup

## Overview
This document provides setup instructions for the complete authentication and registration flow implemented for MediLedger Nexus.

## Features Implemented

### ✅ Complete Authentication Flow
- **Phone OTP Login** with Firebase Authentication
- **Registration Form** with age-based guardian logic
- **Wallet Integration** (HashPack + Custodial options)
- **Hedera Blockchain Logging** for registration and login events
- **Session Management** with JWT tokens

### ✅ Components Created
- `PhoneLogin.tsx` - Phone number input and OTP verification
- `RegistrationForm.tsx` - User profile setup with guardian logic
- `WalletConnect.tsx` - HashPack and custodial wallet connection
- `AuthFlow.tsx` - Main orchestrator component
- Dashboard page for authenticated users

### ✅ Backend Services
- Firebase configuration with provided credentials
- Hedera SDK integration for blockchain logging
- Session management with JWT tokens
- Custodial wallet creation on Hedera Testnet

## Setup Instructions

### 1. Environment Variables
Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_HEDERA_PRIVATE_KEY` - Your Hedera private key for account 0.0.6811703
- `NEXT_PUBLIC_HCS_TOPIC_ID` - HCS Topic ID for logging events
- `JWT_SECRET` - Change from default for production

### 2. Firebase Configuration
Firebase is pre-configured with the provided credentials:
- Project: mediledger-nexus-294e8
- Supports phone authentication with test numbers

### 3. Test Phone Numbers
For demo purposes, use these Firebase test numbers:
- `+1 650-555-3434`
- `+1 650-555-1234`
- `+44 7700 900123`
- `+91 98765 43210`

Default OTP for test numbers: `123456`

### 4. Hedera Setup
- Operator Account: `0.0.6811703`
- Network: Hedera Testnet
- You need to create an HCS Topic and update `NEXT_PUBLIC_HCS_TOPIC_ID`

## Authentication Flow

### Step 1: Phone Verification (`/auth`)
- User enters phone number
- Firebase sends OTP (or use test numbers)
- OTP verification completes phone auth

### Step 2: Registration (New Users)
- Full name (required)
- Date of birth (required)
- Gender (optional)
- Email (optional)
- **Guardian Logic:**
  - Age < 18: Guardian required
  - Age 18-60: Guardian optional
  - Age > 60: Guardian recommended

### Step 3: Wallet Connection
**Option A: HashPack Wallet**
- QR code pairing with HashPack mobile app
- Full custody of private keys
- Advanced security features

**Option B: Custodial Wallet**
- Auto-created on Hedera Testnet
- Keys managed by MediLedger (MVP)
- Instant setup, no app required

### Step 4: Blockchain Logging
Registration events logged to HCS:
```json
{
  "type": "registration",
  "walletId": "0.0.XXXXX",
  "phoneNumber": "+1234567890",
  "dob": "YYYY-MM-DD",
  "guardianWallet": "0.0.XXXXX",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Login events:
```json
{
  "type": "login",
  "walletId": "0.0.XXXXX",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 5: Session Management
- JWT tokens with 7-day expiration
- Stored in localStorage (MVP)
- Includes user ID, phone, wallet ID, and registration status

## Routes

- `/` - Landing page with "Get Started" buttons
- `/auth` - Main authentication flow
- `/login` - Redirects to `/auth`
- `/signup` - Redirects to `/auth`
- `/dashboard` - Protected dashboard for authenticated users

## Color Scheme Consistency
The authentication flow uses the same color scheme as the main website:
- Primary gradient: `from-purple-600 to-pink-600`
- Secondary: `from-cyan-400 to-blue-400`
- Background: Black with purple/cyan gradients
- Cards: `slate-900/50` with `slate-700/50` borders

## Security Features

### ✅ Implemented
- Phone number verification via Firebase
- JWT session tokens
- Hedera blockchain event logging
- reCAPTCHA integration
- Secure key storage (localStorage for MVP)

### 🔄 Production Recommendations
- Move to secure cookie storage
- Implement refresh tokens
- Add rate limiting
- Use hardware security modules for custodial keys
- Add biometric authentication options

## Testing

### Quick Test Flow
1. Visit `/` and click "Get Started"
2. Use test phone number: `+1 650-555-3434`
3. Enter OTP: `123456`
4. Complete registration form
5. Choose wallet option
6. View dashboard

### Wallet Testing
- **HashPack**: Requires HashPack mobile app
- **Custodial**: Works immediately (creates account on Hedera Testnet)

## Troubleshooting

### Common Issues
1. **reCAPTCHA errors**: Check Firebase configuration
2. **Hedera connection**: Verify private key and network settings
3. **Session issues**: Clear localStorage and retry
4. **HashPack pairing**: Ensure mobile app is updated

### Debug Mode
Check browser console for detailed error messages and authentication flow logs.

## Next Steps
- Set up HCS Topic ID
- Configure Hedera private key
- Test with real phone numbers (requires Firebase quota)
- Implement additional security features for production
