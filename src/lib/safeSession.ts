// src/lib/safeSession.ts
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

type SafeSessionResult = {
    session: Session | null;
    error: unknown;
};

export async function safeGetServerSession(): Promise<SafeSessionResult> {
    try {
        const session = await getServerSession(authOptions);
        return { session, error: null };
    } catch (error) {
        console.error('Failed to load server session:', error);
        return { session: null, error };
    }
}
