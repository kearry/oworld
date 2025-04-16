import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '@/context/ui-context';
import { Home, Search, Bell, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function MobileFooter() {
    const { sidebarOpen } = useUI();
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session || sidebarOpen) {
        return null; // Don't show footer if not logged in or sidebar is open
    }

    return (
        <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 md:hidden">
            <div className="grid h-full grid-cols-4">
                <Link
                    href="/"
                    className="flex flex-col items-center justify-center"
                >
                    <Home
                        size={24}
                        className={pathname === '/' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}
                    />
                    <span className="text-xs mt-1">Home</span>
                </Link>

                <Link
                    href="/search"
                    className="flex flex-col items-center justify-center"
                >
                    <Search
                        size={24}
                        className={pathname === '/search' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}
                    />
                    <span className="text-xs mt-1">Search</span>
                </Link>

                <Link
                    href="/notifications"
                    className="flex flex-col items-center justify-center"
                >
                    <Bell
                        size={24}
                        className={pathname === '/notifications' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}
                    />
                    <span className="text-xs mt-1">Notifications</span>
                </Link>

                <Link
                    href="/messages"
                    className="flex flex-col items-center justify-center"
                >
                    <MessageSquare
                        size={24}
                        className={pathname === '/messages' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}
                    />
                    <span className="text-xs mt-1">Messages</span>
                </Link>
            </div>
        </nav>
    );
}