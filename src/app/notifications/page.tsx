// src/app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Heart, MessageSquare, UserPlus, AtSign, Bell } from 'lucide-react';
import { Notification } from '@/lib/validations';

interface NotificationWithDetails extends Notification {
    sourceUser?: {
        id: string;
        username: string;
        handle: string;
        profileImage: string | null;
    };
    postText?: string;
    message?: string;
}

export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Safely extract the current user ID and handle
    const currentUserId = session?.user
        ? (session.user as { id: string }).id
        : '';
    const currentUserHandle = session?.user
        ? (session.user as { handle: string }).handle
        : '';

    // Fetch real notifications from API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notifications');
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data: NotificationWithDetails[] = await res.json();
            setNotifications(data);
            if (data.some(n => !n.read)) {
                await fetch('/api/notifications/mark-read', { method: 'POST' });
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchNotifications();
        }
    }, [status]);

    // Demo / fallback while API isn’t implemented
    useEffect(() => {
        if (status === 'authenticated' && loading) {
            const samples: NotificationWithDetails[] = [
                {
                    id: '1',
                    type: 'like',
                    read: false,
                    userId: currentUserId,
                    sourceId: 'user1',
                    postId: 'post1',
                    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                    sourceUser: {
                        id: 'user1',
                        username: 'Jane Smith',
                        handle: '@janesmith',
                        profileImage: 'https://i.pravatar.cc/150?u=jane',
                    },
                    postText: 'Just launched my new project! Let me know what you think.',
                },
                {
                    id: '2',
                    type: 'follow',
                    read: false,
                    userId: currentUserId,
                    sourceId: 'user2',
                    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                    sourceUser: {
                        id: 'user2',
                        username: 'John Doe',
                        handle: '@johndoe',
                        profileImage: 'https://i.pravatar.cc/150?u=john',
                    },
                },
                {
                    id: '3',
                    type: 'comment',
                    read: true,
                    userId: currentUserId,
                    sourceId: 'user3',
                    postId: 'post2',
                    message: 'This is really insightful! Thanks for sharing.',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    sourceUser: {
                        id: 'user3',
                        username: 'Alex Johnson',
                        handle: '@alexj',
                        profileImage: 'https://i.pravatar.cc/150?u=alex',
                    },
                    postText: 'Here are my thoughts on the latest tech trends.',
                },
                {
                    id: '4',
                    type: 'mention',
                    read: true,
                    userId: currentUserId,
                    sourceId: 'user4',
                    postId: 'post3',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                    sourceUser: {
                        id: 'user4',
                        username: 'Sarah Williams',
                        handle: '@sarahw',
                        profileImage: 'https://i.pravatar.cc/150?u=sarah',
                    },
                    postText: `Hey ${currentUserHandle}, what do you think about this feature?`,
                },
                {
                    id: '5',
                    type: 'message',
                    read: true,
                    userId: currentUserId,
                    sourceId: 'user5',
                    message: 'Could we discuss a potential collaboration?',
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                    sourceUser: {
                        id: 'user5',
                        username: 'Emily Clark',
                        handle: '@emilyc',
                        profileImage: 'https://i.pravatar.cc/150?u=emily',
                    },
                },
            ];
            setNotifications(samples);
            setLoading(false);
        }
    }, [status, loading, currentUserId, currentUserHandle]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={16} className="text-red-500" />;
            case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
            case 'follow': return <UserPlus size={16} className="text-green-500" />;
            case 'mention': return <AtSign size={16} className="text-purple-500" />;
            case 'message': return <MessageSquare size={16} className="text-blue-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    const getNotificationContent = (n: NotificationWithDetails) => {
        switch (n.type) {
            case 'like':
                return <> <span className="font-bold">{n.sourceUser?.username}</span> liked your post </>;
            case 'comment':
                return (
                    <>
                        <span className="font-bold">{n.sourceUser?.username}</span> commented:
                        <span className="block mt-1 text-gray-600 dark:text-gray-400 text-sm">{n.message}</span>
                    </>
                );
            case 'follow':
                return <> <span className="font-bold">{n.sourceUser?.username}</span> followed you </>
            case 'mention':
                return <> <span className="font-bold">{n.sourceUser?.username}</span> mentioned you </>
            case 'message':
                return (
                    <>
                        <span className="font-bold">{n.sourceUser?.username}</span> sent you a message:
                        <span className="block mt-1 text-gray-600 dark:text-gray-400 text-sm">{n.message}</span>
                    </>
                );
            default:
                return <span>New notification</span>;
        }
    };

    const getNotificationLink = (n: NotificationWithDetails) => {
        switch (n.type) {
            case 'like':
            case 'comment':
            case 'mention':
                return n.postId ? `/post/${n.postId}` : '#';
            case 'follow':
                return n.sourceUser ? `/profile/${n.sourceUser.handle}` : '#';
            case 'message':
                return '/messages';
            default:
                return '#';
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Sign in to view notifications</h1>
                <p>You need to be signed in to access this page.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 pb-16 md:pb-4">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>
            {error && (
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-600 dark:text-red-200 mb-4">
                    {error}
                </div>
            )}
            {notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow">
                    <Bell size={40} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        When you get notifications, they’ll appear here.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((n) => (
                        <Link
                            key={n.id}
                            href={getNotificationLink(n)}
                            className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <div className="flex items-start">
                                {n.sourceUser?.profileImage ? (
                                    <Image
                                        src={n.sourceUser.profileImage}
                                        alt={n.sourceUser.username}
                                        width={48}
                                        height={48}
                                        className="rounded-full mr-4"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 flex items-center justify-center">
                                        {getNotificationIcon(n.type)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="text-sm sm:text-base">{getNotificationContent(n)}</div>
                                        {!n.read && <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full" />}
                                    </div>
                                    {n.postText && (
                                        <div className="mt-2 p-3 rounded bg-gray-100 dark:bg-gray-700 text-sm">
                                            {n.postText}
                                        </div>
                                    )}
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
