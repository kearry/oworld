'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import FollowButton from '@/components/user/FollowButton';
import FollowStats from '@/components/user/FollowStats';

interface User {
    id: string;
    username: string;
    handle: string;
    profileImage: string | null;
    bio: string | null;
    createdAt: string;
}

interface Post {
    id: string;
    text: string;
    images: string | null;
    createdAt: string;
    author: {
        username: string;
        handle: string;
        profileImage: string | null;
    };
    _count: {
        comments: number;
        likes: number;
    };
}

export default function ProfilePage() {
    const { handle } = useParams();
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);

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

        const fetchPosts = async (userId: string) => {
            try {
                const response = await fetch(`/api/users/${userId}/posts`);
                if (!response.ok) {
                    throw new Error('Failed to load posts');
                }
                return await response.json();
            } catch (err) {
                console.error('Error fetching posts:', err);
                return [];
            }
        };

        const checkFollowStatus = async (userId: string) => {
            if (!session?.user) return false;

            try {
                const response = await fetch(`/api/users/${session.user.id}/follows/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    return data.following;
                }
                return false;
            } catch (err) {
                console.error('Error checking follow status:', err);
                return false;
            }
        };

        const loadData = async () => {
            setLoading(true);
            const userData = await fetchUser();

            if (userData) {
                setUser(userData);
                const postsData = await fetchPosts(userData.id);
                setPosts(postsData);

                if (session?.user) {
                    const followStatus = await checkFollowStatus(userData.id);
                    setIsFollowing(followStatus);
                }
            }

            setLoading(false);
        };

        loadData();
    }, [handle, session]);

    const handleFollowChange = (following: boolean) => {
        setIsFollowing(following);
    };

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
        <div className="max-w-2xl mx-auto pb-16 md:pb-4">
            {/* Cover image */}
            <div className="h-32 bg-blue-100 dark:bg-blue-900 relative mb-16">
                {/* Profile image */}
                <div className="absolute -bottom-12 left-4">
                    <Image
                        src={user.profileImage || '/default-avatar.png'}
                        alt={user.username}
                        width={96}
                        height={96}
                        className="rounded-full border-4 border-white dark:border-gray-800"
                    />
                </div>
            </div>

            <div className="px-4">
                {/* Profile actions */}
                <div className="flex justify-end mb-4">
                    {session?.user.id === user.id ? (
                        <Link
                            href="/settings/profile"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Edit profile
                        </Link>
                    ) : (
                        <FollowButton
                            userId={user.id}
                            initialFollowing={isFollowing}
                            onFollowChange={handleFollowChange}
                        />
                    )}
                </div>

                {/* User info */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold">{user.username}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{user.handle}</p>

                    {user.bio && (
                        <p className="mt-3">{user.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>

                    {/* Follow stats */}
                    <div className="mt-4">
                        <FollowStats userId={user.id} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <div className="flex">
                        <button className="px-4 py-2 border-b-2 border-blue-500 font-medium text-blue-500">
                            Posts
                        </button>
                        <button className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            Replies
                        </button>
                        <button className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            Media
                        </button>
                        <button className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            Likes
                        </button>
                    </div>
                </div>

                {/* Posts */}
                {posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {user.username} hasn't posted anything yet.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {posts.map((post) => (
                            <div key={post.id} className="py-4">
                                <p className="mb-2">{post.text}</p>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}