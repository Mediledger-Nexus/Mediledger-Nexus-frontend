import jwt from 'jsonwebtoken';
import { User } from 'firebase/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'mediledger-nexus-secret-key';

export interface SessionData {
  uid: string;
  phoneNumber: string;
  walletId?: string;
  did?: string;
  isRegistered: boolean;
  provider?: string;
  network?: string;
  exp?: number;
  role?: string;  // Added for role-based routing (patient, doctor, organization)
}

export class SessionManager {
  /**
   * Generate JWT token for authenticated user
   */
  static generateToken(user: User, walletId?: string, isRegistered: boolean = false): string {
    const payload: SessionData = {
      uid: user.uid,
      phoneNumber: user.phoneNumber || '',
      walletId,
      isRegistered,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): SessionData | null {
    console.log('🔐 SessionManager.verifyToken - Verifying token:', token?.substring(0, 50) + '...');

    try {
      const result = jwt.verify(token, JWT_SECRET) as SessionData;
      console.log('✅ SessionManager.verifyToken - JWT verification successful:', result);
      return result;
    } catch (error) {
      console.log('❌ SessionManager.verifyToken - JWT verification failed:', error);
      console.log('🔄 SessionManager.verifyToken - Trying unsigned token fallback...');

      // Fallback: try to parse unsigned session format
      const parsed = parseUnsignedToken(token);
      if (parsed) {
        console.log('✅ SessionManager.verifyToken - Unsigned token parsed successfully:', parsed);
        return parsed;
      }

      console.error('❌ SessionManager.verifyToken - Both JWT and unsigned token verification failed');
      return null;
    }
  }

  /**
   * Store session in localStorage (client-side)
   */
  static storeSession(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mediledger_session', token);
    }
  }

  /**
   * Get session from localStorage
   */
  static getSession(): SessionData | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mediledger_session');
      console.log('🔍 SessionManager.getSession - Raw token from localStorage:', token);

      if (token) {
        const result = this.verifyToken(token);
        console.log('🔍 SessionManager.getSession - Verification result:', result);
        return result;
      }
      console.log('❌ SessionManager.getSession - No token found in localStorage');
    }
    return null;
  }

  /**
   * Clear session
   */
  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mediledger_session');
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && (session.exp || 0) > Date.now() / 1000;
  }
}

/**
 * Create a session token from arbitrary session data and persist it client-side.
 * This is used by the AuthFlow to store role, wallet, and profile in a JWT
 * without requiring a Firebase User instance.
 */
export async function createSession(data: Record<string, any>): Promise<string> {
  console.log('🔧 createSession - Creating session with data:', data);

  // Sign provided data with 7-day expiration
  try {
    const token = jwt.sign({ ...data }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ createSession - JWT token created successfully');

    if (typeof window !== 'undefined') {
      localStorage.setItem('mediledger_session', token);
      console.log('💾 createSession - Token stored in localStorage');
    }
    return token;
  } catch (e) {
    console.log('❌ createSession - JWT signing failed, using unsigned fallback:', e);

    // Browser-safe unsigned fallback (no crypto). Include exp for validity checks.
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const payload = { ...data, exp, __unsigned: true };
    const raw = typeof btoa === 'function' ? btoa(JSON.stringify(payload)) : Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    const token = `u.${raw}`;

    console.log('🔄 createSession - Unsigned token created:', token?.substring(0, 50) + '...');

    if (typeof window !== 'undefined') {
      localStorage.setItem('mediledger_session', token);
      console.log('💾 createSession - Unsigned token stored in localStorage');
    }
    return token;
  }
}

// Try to parse an unsigned session token created by the fallback above.
function parseUnsignedToken(token: string): SessionData | null {
  try {
    if (!token || token.length < 3) return null;
    // Expect format: 'u.' + base64(json)
    if (!token.startsWith('u.')) return null;
    const raw = token.slice(2);
    const json = typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf-8');
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== 'object') return null;
    // Basic exp validation
    if (typeof obj.exp !== 'number' || obj.exp <= Math.floor(Date.now() / 1000)) return null;
    return obj as SessionData;
  } catch {
    return null;
  }
}
