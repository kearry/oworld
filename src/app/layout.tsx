// src/app/layout.tsx
import './globals.css';
//import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AuthProvider from '@/components/providers/AuthProvider';
import { UIProvider } from '@/context/ui-context';
import ClientLayout from '@/components/layout/ClientLayout';
import { safeGetServerSession } from '@/lib/safeSession';
import '@/lib/localStorageShim';

//const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'SocialApp',
  description: 'A social media application built with Next.js and TypeScript',
};
interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const { session } = await safeGetServerSession();

  return (
    <html lang="en">
      <head>
        <title>SocialApp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider session={session}>
          <UIProvider>
            <ClientLayout>{children}</ClientLayout>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
