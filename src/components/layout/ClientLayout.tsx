'use client';

import { UIProvider } from '@/context/ui-context';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import MobileFooter from '@/components/layout/MobileFooter';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <UIProvider>
                <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Sidebar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <MobileFooter />
                </div>
            </UIProvider>
        </SessionProvider>
    );
}