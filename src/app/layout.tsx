import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UIProvider } from '@/context/ui-context';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/layout/Sidebar';
import MobileFooter from '@/components/layout/MobileFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Social Media App',
  description: 'A Next.js social media application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}