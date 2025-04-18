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
    Loader2,
} from 'lucide-react';

// Define the minimal shape of session.user we need
interface SessionUser {
    id: string;
    name?: string | null;
    username?: string;
    handle?: string;
    email?: string | null;
    image?: string | null;
}

export default function Sidebar() {
    const { data: session, status } = useSession();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode, setSidebarOpen } = useUI();
    const pathname = usePathname();
    const [followerCount, setFollowerCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);
    const [loadingCounts, setLoadingCounts] = useState(false);

    // Safely cast session.user to our SessionUser interface
    const sessionUser = (status === 'authenticated' && session?.user)
        ? (session.user as SessionUser)
        : null;

    const currentUserId = sessionUser?.id ?? null;

    const fetchFollowCounts = useCallback(async () => {
        if (!currentUserId) {
            setFollowerCount(null);
            setFollowingCount(null);
            return;
        }
        setLoadingCounts(true);
        try {
            const res = await fetch(`/api/users/${currentUserId}/follow-counts`);
            if (res.ok) {
                const data = await res.json();
                setFollowerCount(data.followers);
                setFollowingCount(data.following);
            } else {
                console.error('[Sidebar] Failed to fetch follow counts', res.status);
                setFollowerCount(0);
                setFollowingCount(0);
            }
        } catch (error) {
            console.error('[Sidebar] Error fetching follow counts', error);
            setFollowerCount(0);
            setFollowingCount(0);
        } finally {
            setLoadingCounts(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchFollowCounts();
    }, [fetchFollowCounts]);

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [setSidebarOpen]);

    if (status === 'loading') {
        return (
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col transition-width duration-200 overflow-hidden ${sidebarOpen ? 'w-64' : 'w-16'}`}
            >
                <div className="p-4 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-pulse text-gray-400" />
                </div>
            </aside>
        );
    }

    const handleSignIn = () => signIn();
    const handleSignOut = () => signOut({ callbackUrl: '/auth/signin' });

    if (status !== 'authenticated') {
        return (
            <aside
                className="fixed top-0 left-0 z-40 h-screen w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        p-4 flex flex-col items-center space-y-4"
            >
                <button
                    onClick={handleSignIn}
                    aria-label="Sign In"
                    className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-500"
                >
                    <LogIn size={24} />
                    <span className="text-xs">Sign In</span>
                </button>
                <button
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="mt-auto flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-500"
                >
                    {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                    <span className="text-xs">{darkMode ? 'Light' : 'Dark'}</span>
                </button>
            </aside>
        );
    }

    // Now that we're authenticated:
    const user = sessionUser!;
    const displayName = user.username || user.name || user.email || '';
    const displayHandle = user.handle ? `@${user.handle}` : '';
    const profileLink = `/profile/${user.handle}`;

    return (
        <>
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col transition-width duration-200 overflow-y-auto ${sidebarOpen ? 'w-64' : 'w-16'}`}
            >
                {/* Header */}
                <div
                    className={`flex items-center p-4 sticky top-0 bg-white dark:bg-gray-800 z-10
        ${sidebarOpen ? 'justify-between' : 'justify-center'}`}
                >
                    {sidebarOpen && (
                        <Link href="/" className="text-xl font-bold text-blue-500 hover:opacity-80">
                            SocialApp
                        </Link>
                    )}
                    <button
                        onClick={toggleSidebar}
                        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Profile */}
                {sidebarOpen && (
                    <div className="mb-6 px-4 pt-2">
                        <Link
                            href={profileLink}
                            className="block hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg"
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <Image
                                    src={user.image ?? '/default-avatar.png'}
                                    alt="Profile"
                                    width={48}
                                    height={48}
                                    className="rounded-full bg-gray-200 dark:bg-gray-600"
                                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/default-avatar.png')}
                                />
                                <div className="overflow-hidden">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {displayName}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {displayHandle}
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <div className="flex justify-between text-sm px-2">
                            {loadingCounts ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" />
                            ) : (
                                <>
                                    <Link
                                        href={`${profileLink}/followers`}
                                        className="hover:underline text-gray-700 dark:text-gray-300"
                                    >
                                        <span className="font-bold">{followerCount ?? 0}</span>{' '}
                                        Followers
                                    </Link>
                                    <Link
                                        href={`${profileLink}/following`}
                                        className="hover:underline text-gray-700 dark:text-gray-300"
                                    >
                                        <span className="font-bold">{followingCount ?? 0}</span>{' '}
                                        Following
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Nav */}
                <nav className="flex-1 px-2 space-y-1">
                    {[
                        { label: 'Home', icon: Home, href: '/' },
                        { label: 'Search', icon: Search, href: '/search' },
                        { label: 'Notifications', icon: Bell, href: '/notifications' },
                        { label: 'Messages', icon: MessageSquare, href: '/messages' },
                        { label: 'Profile', icon: User, href: profileLink },
                        { label: 'Analytics', icon: BarChart2, href: '/analytics' },
                        { label: 'Communities', icon: Users, href: '/communities' },
                    ].map(({ label, icon: Icon, href }) => {
                        const isActive = href === pathname;
                        const classes = `group flex items-center p-2 rounded-lg transition-colors
              ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`;
                        return (
                            <Link key={label} href={href} className={classes} aria-current={isActive ? 'page' : undefined}>
                                <Icon size={20} className={sidebarOpen ? '' : 'mx-auto'} />
                                {sidebarOpen && <span className="ml-3">{label}</span>}
                                {!sidebarOpen && (
                                    <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white
                      bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="mt-auto px-2 pb-4 space-y-1 sticky bottom-0 bg-white dark:bg-gray-800 py-2">
                    {[
                        { label: 'Settings', icon: Settings, href: '/settings' },
                        { label: darkMode ? 'Light Mode' : 'Dark Mode', icon: darkMode ? Sun : Moon, action: toggleDarkMode },
                        { label: 'Logout', icon: LogOut, action: handleSignOut },
                    ].map(({ label, icon: Icon, href, action }) => {
                        const isActive = href && pathname.startsWith(href);
                        const classes = `group flex items-center p-2 rounded-lg w-full transition-colors
              ${isActive
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`;
                        const content = (
                            <>
                                <Icon size={20} className={sidebarOpen ? '' : 'mx-auto'} />
                                {sidebarOpen && <span className="ml-3">{label}</span>}
                                {!sidebarOpen && (
                                    <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white
                      bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {label}
                                    </span>
                                )}
                            </>
                        );
                        return href ? (
                            <Link key={label} href={href} className={classes} aria-current={isActive ? 'page' : undefined}>
                                {content}
                            </Link>
                        ) : (
                            <button key={label} onClick={action} className={classes} aria-label={label}>
                                {content}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
