# MediLedger NFT Consent System Architecture

## How It Works Together:

### 1. User Wallets (HashPack)
- Patient wallet: Signs consent grants/revokes
- Doctor wallet: Receives consent NFTs
- Used for: Authentication, signing, NFT ownership

### 2. Operator Account (Portal/Testnet Account)
- Pays for: NFT minting fees, HCS logging fees
- Creates: NFTs and logs on blockchain
- Used for: Backend blockchain operations

### 3. The Flow:
Patient (HashPack) → Signs Consent → Operator Mints NFT → NFT Goes to Doctor (HashPack)

## Example:
- Patient DID: did:hedera:0.0.7123249 (HashPack wallet)
- Doctor DID: did:hedera:0.0.8888888 (HashPack wallet)  
- Operator: 0.0.9999999 (Portal account - pays fees)
- Result: NFT minted from operator TO doctor's HashPack wallet
