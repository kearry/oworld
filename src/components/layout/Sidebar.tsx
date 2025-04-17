// src/components/layout/Sidebar.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
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
    LogIn,
    LogOut,
} from 'lucide-react';

export default function Sidebar() {
    const { data: session, status } = useSession();
    const ui = useUI();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = ui;
    const pathname = usePathname();
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // Debug logs
    console.debug('[Sidebar] status:', status);
    console.debug('[Sidebar] session.user:', session?.user);
    console.debug('[Sidebar] UI context:', ui);

    const fetchFollowCounts = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            console.debug('[Sidebar] fetching follow counts for', session.user.id);
            const response = await fetch(
                `/api/users/${session.user.id}/follow-counts`
            );
            if (response.ok) {
                const data = await response.json();
                console.debug('[Sidebar] follow counts response:', data);
                setFollowerCount(data.followers);
                setFollowingCount(data.following);
            }
        } catch (error) {
            console.error('[Sidebar] Failed to fetch follow counts:', error);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchFollowCounts();
    }, [fetchFollowCounts]);

    if (status === 'loading') {
        console.debug('[Sidebar] rendering loading skeleton');
        return (
            <aside className="fixed top-0 left-0 z-40 h-screen w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="flex justify-center p-4">
                    <div className="animate-pulse h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
            </aside>
        );
    }

    if (!session) {
        console.debug('[Sidebar] user not signed in');
        return (
            <aside className="fixed top-0 left-0 z-40 h-screen w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
                <button
                    onClick={() => {
                        console.debug('[Sidebar] signIn() called');
                        signIn();
                    }}
                    className="flex flex-col items-center space-y-1"
                >
                    <LogIn size={24} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">Sign In</span>
                </button>
            </aside>
        );
    }

    const displayName = session.user.username;
    const displayHandle = session.user.handle;

    console.debug('[Sidebar] rendering signed-in sidebar for handle:', displayHandle);

    return (
        <>
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-width duration-200 overflow-hidden ${sidebarOpen ? 'w-64' : 'w-16'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    {sidebarOpen && (
                        <Link href="/" className="text-xl font-bold text-blue-500">
                            SocialApp
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            console.debug('[Sidebar] toggleSidebar() called, now open:', !sidebarOpen);
                            toggleSidebar();
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Profile Section */}
                {sidebarOpen && (
                    <div className="mb-6 px-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <Image
                                src={session.user.image ?? '/default-avatar.png'}
                                alt={displayName}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    {displayName}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    @{displayHandle}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <Link
                                href={`/profile/${displayHandle}/followers`}
                                className="hover:underline"
                                onClick={() =>
                                    console.debug('[Sidebar] navigate to followers of', displayHandle)
                                }
                            >
                                <span className="font-bold">{followerCount}</span> Followers
                            </Link>
                            <Link
                                href={`/profile/${displayHandle}/following`}
                                className="hover:underline"
                                onClick={() =>
                                    console.debug('[Sidebar] navigate to following of', displayHandle)
                                }
                            >
                                <span className="font-bold">{followingCount}</span> Following
                            </Link>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-2 space-y-1">
                    {[
                        { label: 'Home', icon: Home, href: '/' },
                        { label: 'Search', icon: Search, href: '/search' },
                        { label: 'Notifications', icon: Bell, href: '/notifications' },
                        { label: 'Messages', icon: MessageSquare, href: '/messages' },
                        { label: 'Profile', icon: User, href: `/profile/${displayHandle}` },
                        { label: 'Analytics', icon: BarChart2, href: '/analytics' },
                        { label: 'Communities', icon: Users, href: '/communities' },
                    ].map(({ label, icon: Icon, href }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={() => console.debug('[Sidebar] nav click:', label, href)}
                            className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${pathname === href || pathname.startsWith(href + '/')
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : ''
                                }`}
                        >
                            <Icon size={20} />
                            {sidebarOpen && <span className="ml-3">{label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Controls */}
                <div className="mt-auto px-2 pb-4 space-y-1">
                    <Link
                        href="/settings"
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${pathname.startsWith('/settings')
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : ''
                            }`}
                        onClick={() => console.debug('[Sidebar] navigate to settings')}
                    >
                        <Settings size={20} />
                        {sidebarOpen && <span className="ml-3">Settings</span>}
                    </Link>
                    <button
                        onClick={() => {
                            console.debug('[Sidebar] toggleDarkMode() called, now dark:', !darkMode);
                            toggleDarkMode();
                        }}
                        className="flex items-center p-2 rounded-lg w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {sidebarOpen && (
                            <span className="ml-3">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            console.debug('[Sidebar] signOut() called');
                            signOut({ callbackUrl: '/auth/signin' });
                        }}
                        className="flex items-center p-2 rounded-lg w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
                    onClick={() => {
                        console.debug('[Sidebar] overlay click, toggling sidebar');
                        toggleSidebar();
                    }}
                />
            )}
        </>
    );
}