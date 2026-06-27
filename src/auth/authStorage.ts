import { z } from 'zod';
import { tokenResponseSchema } from '../api/schemas';
import type { TokenResponse } from '../api/types';

const STORAGE_KEY = 'atlas-marketplace.session';
const authSessionSchema = tokenResponseSchema.extend({ email: z.string().email() });

export interface AuthSession extends TokenResponse {
  email: string;
}

/**
 * Access tokens are deliberately scoped to the current tab. The backend does
 * not expose refresh tokens or secure HttpOnly session cookies, so this avoids
 * silently persisting a bearer token across browser restarts.
 */
export const authStorage = {
  read(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = authSessionSchema.safeParse(JSON.parse(raw));
      if (!parsed.success || new Date(parsed.data.expiresAt).getTime() <= Date.now()) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed.data;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
  write(session: AuthSession): void {
    const parsed = authSessionSchema.parse(session);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  },
  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};
