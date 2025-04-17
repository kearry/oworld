// src/components/providers/AuthProvider.tsx
'use client';

import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps extends Pick<SessionProviderProps, 'session'> {
    children: ReactNode;
}

export default function AuthProvider({ session, children }: AuthProviderProps) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}