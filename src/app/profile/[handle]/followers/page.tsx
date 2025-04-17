'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import FollowButton from '@/components/user/FollowButton';

interface User {
    id: string;
    username: string;
    handle: string;
    profileImage: string | null;
    bio: string | null;
}

export default function FollowersPage() {
    const { handle } = useParams();
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [followers, setFollowers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/by-handle/${handle}`);
                if (!response.ok) {
                    throw new Error('User not found');
                }
                return await response.json();
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('User not found');
                return null;
            }
        };

        const fetchFollowers = async (userId: string) => {
            try {
                const response = await fetch(`/api/users/${userId}/followers`);
                if (!response.ok) {
                    throw new Error('Failed to load followers');
                }
                return await response.json();
            } catch (err) {
                console.error('Error fetching followers:', err);
                setError('Failed to load followers');
                return [];
            }
        };

        const loadData = async () => {
            setLoading(true);
            const userData = await fetchUser();

            if (userData) {
                setUser(userData);
                const followersData = await fetchFollowers(userData.id);
                setFollowers(followersData);
            }

            setLoading(false);
        };

        loadData();
    }, [handle]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-600 dark:text-red-200">
                    {error || 'An error occurred'}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center mb-6">
                <Link href={`/profile/${handle}`} className="mr-4">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold">Followers</h1>
                    <p className="text-gray-600 dark:text-gray-400">People following {user.username}</p>
                </div>
            </div>

            {followers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {user.username} doesn't have any followers yet.
                </div>
            ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {followers.map((follower) => (
                        <div key={follower.id} className="py-4 flex items-center justify-between">
                            <Link href={`/profile/${follower.handle}`} className="flex items-center">
                                <Image
                                    src={follower.profileImage || '/default-avatar.png'}
                                    alt={follower.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                />
                                <div className="ml-3">
                                    <div className="font-medium">{follower.username}</div>
                                    <div className="text-gray-500 dark:text-gray-400">{follower.handle}</div>
                                </div>
                            </Link>

                            {session?.user.id !== follower.id && (
                                <FollowButton userId={follower.id} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}