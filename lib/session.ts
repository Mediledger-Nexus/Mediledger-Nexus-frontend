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
    try {
      return jwt.verify(token, JWT_SECRET) as SessionData;
    } catch (error) {
      // Fallback: try to parse unsigned session format
      const parsed = parseUnsignedToken(token);
      if (parsed) return parsed;
      console.error('Token verification failed:', error);
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
      if (token) {
        return this.verifyToken(token);
      }
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
  // Sign provided data with 7-day expiration
  try {
    const token = jwt.sign({ ...data }, JWT_SECRET, { expiresIn: '7d' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('mediledger_session', token);
    }
    return token;
  } catch (e) {
    // Browser-safe unsigned fallback (no crypto). Include exp for validity checks.
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const payload = { ...data, exp, __unsigned: true };
    const raw = typeof btoa === 'function' ? btoa(JSON.stringify(payload)) : Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    const token = `u.${raw}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mediledger_session', token);
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
