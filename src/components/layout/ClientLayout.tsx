// src/components/layout/ClientLayout.tsx
'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileFooter from '@/components/layout/MobileFooter';
import ThemeSync from '@/components/providers/ThemeSync';

interface ClientLayoutProps {
    children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <>
            {/* Keep the HTML class in sync */}
            <ThemeSync />

            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                <Sidebar />
                <main className="flex-1 p-4">{children}</main>
                <MobileFooter />
            </div>
        </>
    );
}