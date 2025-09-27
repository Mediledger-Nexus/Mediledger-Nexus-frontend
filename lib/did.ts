// Simple DID computation for Hedera accounts for hackathon demo
// Format: did:hedera:<network>:<accountId>

export function computeDid(accountId: string, network?: string): string {
  const net = (network || process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet').toLowerCase();
  const acct = String(accountId || '').trim();
  return `did:hedera:${net}:${acct}`;
}

export function isDid(value: string | undefined | null): boolean {
  return !!value && /^did:hedera:(mainnet|testnet|previewnet):0\.0\.\d+$/i.test(value);
}
