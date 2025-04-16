import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useUI } from '@/context/ui-context';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    Home,
    Search,
    Bell,
    MessageSquare,
    User,
    BarChart2,
    Users,
    Settings,
    Moon,
    Sun,
    Menu,
    X
} from 'lucide-react';
import { Follow } from '@/lib/validations';

export default function Sidebar() {
    const { data: session } = useSession();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = useUI();
    const pathname = usePathname();
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    useEffect(() => {
        if (session?.user?.id) {
            fetchFollowCounts();
        }
    }, [session?.user?.id]);

    const fetchFollowCounts = async () => {
        try {
            const response = await fetch(`/api/users/${session?.user.id}/follow-counts`);
            if (response.ok) {
                const data = await response.json();
                setFollowerCount(data.followers);
                setFollowingCount(data.following);
            }
        } catch (error) {
            console.error('Failed to fetch follow counts:', error);
        }
    };

    if (!session) {
        return null; // Don't show sidebar if not logged in
    }

    return (
        <>
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300 
          ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'} 
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        `}
            >
                <div className="flex flex-col h-full px-3 py-4">
                    <div className="flex justify-between items-center mb-6">
                        {sidebarOpen ? (
                            <Link href="/" className="text-xl font-bold text-blue-500">SocialApp</Link>
                        ) : null}
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Profile section */}
                    {sidebarOpen && (
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Image
                                    src={session.user.image || '/default-avatar.png'}
                                    alt={session.user.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                />
                                <div>
                                    <h3 className="font-medium">{session.user.username}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.user.handle}</p>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm mb-4">
                                <Link href="/followers" className="hover:underline">
                                    <span className="font-bold">{followerCount}</span> Followers
                                </Link>
                                <Link href="/following" className="hover:underline">
                                    <span className="font-bold">{followingCount}</span> Following
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Navigation links */}
                    <nav className="flex-1">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <Home size={20} />
                                    {sidebarOpen && <span className="ml-3">Home</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/search"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/search' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <Search size={20} />
                                    {sidebarOpen && <span className="ml-3">Search</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/notifications"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/notifications' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <Bell size={20} />
                                    {sidebarOpen && <span className="ml-3">Notifications</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/messages"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/messages' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <MessageSquare size={20} />
                                    {sidebarOpen && <span className="ml-3">Messages</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/profile"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/profile' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <User size={20} />
                                    {sidebarOpen && <span className="ml-3">Profile</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/analytics"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/analytics' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <BarChart2 size={20} />
                                    {sidebarOpen && <span className="ml-3">Analytics</span>}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/communities"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/communities' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <Users size={20} />
                                    {sidebarOpen && <span className="ml-3">Communities</span>}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Bottom section */}
                    <div className="mt-auto">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/settings"
                                    className={`
                    flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                    ${pathname === '/settings' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                  `}
                                >
                                    <Settings size={20} />
                                    {sidebarOpen && <span className="ml-3">Settings</span>}
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={toggleDarkMode}
                                    className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                    {sidebarOpen && (
                                        <span className="ml-3">
                                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                                        </span>
                                    )}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-gray-900 bg-opacity-50"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}