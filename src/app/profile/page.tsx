// src/app/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileIndexRedirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // 1. Still loading the session → do nothing
        if (status === 'loading') return;

        // 2. Not signed in → go to sign-in
        if (status === 'unauthenticated' || !session?.user) {
            router.replace('/auth/signin');
            return;
        }

        // 3. Signed in but no handle → send to settings
        const handle = session.user.handle;
        if (!handle) {
            console.error('No handle in session.user:', session.user);
            router.replace('/settings');
            return;
        }

        // 4. Valid handle → go to your profile
        router.replace(`/profile/${handle}`);
    }, [session, status, router]);

    return null;
}