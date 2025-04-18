// src/app/profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProfileRootPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        // 1. Not signed in → send to sign-in
        if (status === 'unauthenticated' || !session?.user) {
            router.replace('/auth/signin');
            return;
        }

        // 2. Signed in & has handle → redirect to that handle’s page
        // Cast so TS knows session.user.handle exists
        const handle = (session.user as { handle: string }).handle;
        if (handle) {
            router.replace(`/profile/${handle}`);
            return;
        }

        // 3. Signed in but no handle → send to settings
        console.error('No handle in session.user:', session.user);
        router.replace('/settings');
    }, [session, status, router]);

    // While redirecting, render nothing
    return null;
}
