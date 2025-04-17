'use client';

import { Suspense } from 'react';
import { FeedProvider } from '@/context/feed-context';
import TabBar from '@/components/feed/TabBar';
import Feed from '@/components/feed/Feed';
import FloatingActionButton from '@/components/post/FloatingActionButton';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <FeedProvider>
      <div className="pb-16 md:pb-0">
        {/* Tab Bar */}
        <TabBar />

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          }>
            <Feed />
          </Suspense>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
    </FeedProvider>
  );
}