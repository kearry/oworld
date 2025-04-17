'use client';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useUI } from '@/context/ui-context';
import { useState, useEffect, useCallback } from 'react';
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
    X,
    LogIn
} from 'lucide-react';

export default function Sidebar() {
    const { data: session, status } = useSession();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = useUI();
    const pathname = usePathname();
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const fetchFollowCounts = useCallback(async () => {
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
    }, [session?.user?.id]);

    useEffect(() => {
        if (session?.user?.id) {
            fetchFollowCounts();
        }
    }, [session?.user?.id, fetchFollowCounts]);

    // If loading, show a simplified sidebar
    if (status === 'loading') {
        return (
            <aside className="fixed top-0 left-0 z-40 h-screen w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="flex justify-center p-4">
                    <div className="animate-pulse h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
            </aside>
        );
    }

    // If not authenticated, show login sidebar
    if (!session) {
        return (
            <aside className="fixed top-0 left-0 z-40 h-screen transition-all duration-300 
                w-64 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="flex flex-col h-full px-3 py-4">
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/" className="text-xl font-bold text-blue-500">SocialApp</Link>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">Welcome to SocialApp</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">Connect with friends and the world around you.</p>
                        </div>

                        <button
                            onClick={() => signIn()}
                            className="w-full flex items-center justify-center py-2.5 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Sign In
                        </button>

                        <Link href="/auth/signup" className="text-blue-600 hover:underline">
                            Don't have an account? Sign up
                        </Link>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            <span className="ml-3">
                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        );
    }

    // Authenticated sidebar (original code)
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
                                    alt={session.user.username || 'User'}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                />
                                <div>
                                    <h3 className="font-medium">{session.user.username || 'User'}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.user.handle || '@user'}</p>
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