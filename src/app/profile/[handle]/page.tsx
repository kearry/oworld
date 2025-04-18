'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
//import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FollowButton from '@/components/user/FollowButton';
import FollowStats from '@/components/user/FollowStats';
import EditProfileModal from '@/components/profile/EditProfileModal';

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
    _count: {
        comments: number;
        likes: number;
    };
}

export default function ProfilePage() {
    const { handle } = useParams();
    const { data: session } = useSession();
    //const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const checkFollowStatus = useCallback(async (userId: string) => {
        try {
            const resFollow = await fetch(
                `/api/users/${session?.user.id}/follows/${userId}`
            );
            if (resFollow.ok) {
                const { following } = await resFollow.json();
                setIsFollowing(following);
            }
        } catch (err) {
            console.error('Error checking follow status:', err);
        }
    }, [session?.user.id]);

    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch user by handle
            const resUser = await fetch(`/api/users/by-handle/${handle}`);
            if (!resUser.ok) {
                const errorData = await resUser.json();
                throw new Error(errorData.error || 'User not found');
            }

            const userData: User = await resUser.json();
            setUser(userData);

            // Fetch posts
            await fetchUserPosts(userData.id);

            // Check follow status if logged in
            if (session?.user && session.user.id !== userData.id) {
                await checkFollowStatus(userData.id);
            }
        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast.error('Could not load profile');
        } finally {
            setLoading(false);
        }
    }, [handle, session?.user, checkFollowStatus]);

    const fetchUserPosts = async (userId: string) => {
        try {
            const resPosts = await fetch(`/api/users/${userId}/posts`);
            if (resPosts.ok) {
                const postsData = await resPosts.json();
                setPosts(postsData);
            } else {
                console.error('Failed to fetch posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    // Removed duplicate declaration of checkFollowStatus

    useEffect(() => {
        if (handle) {
            fetchUserData();
        }
    }, [handle, session?.user.id, fetchUserData]);

    const handleFollowChange = (following: boolean) => {
        setIsFollowing(following);
    };

    const handleProfileUpdate = () => {
        // Refresh user data after profile update
        fetchUserData();
        toast.success('Profile updated successfully');
    };

    const isCurrentUser = () => {
        if (!session || !session.user || !user) return false;

        // Check by ID
        const matchById = session.user.id === user.id;

        // Check by handle (as fallback)
        const matchByHandle = session.user.handle === user.handle;

        return matchById || matchByHandle;
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
        <>
            <EditProfileModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                user={
                    user
                        ? {
                              ...user,
                              profileImage: user.profileImage || undefined,
                              bio: user.bio || undefined,
                          }
                        : null
                }
                onProfileUpdate={handleProfileUpdate}
            />

            <div className="max-w-2xl mx-auto pb-16 md:pb-4">
                {/* Debug info - remove in production */}
                <div className="bg-yellow-100 dark:bg-yellow-900 p-2 mb-4 text-xs overflow-auto">
                    <p>Debug Info (remove in production):</p>
                    <p>Profile user ID: {user.id}</p>
                    <p>Session user ID: {session?.user?.id || 'Not logged in'}</p>
                    <p>Is owner: {String(session?.user?.id === user.id)}</p>
                    <p>Has bio: {String(!!user.bio)}</p>
                    <p>Bio content: {user.bio || 'No bio'}</p>
                </div>

                {/* Cover & Profile Image */}
                <div className="h-32 bg-blue-100 dark:bg-blue-900 relative mb-16">
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
                    {/* Profile Actions */}
                    <div className="flex justify-end mb-4">
                        {isCurrentUser() ? (
                            <button
                                onClick={() => setEditOpen(true)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Edit profile
                            </button>
                        ) : (
                            <FollowButton
                                userId={user.id}
                                initialFollowing={isFollowing}
                                onFollowChange={handleFollowChange}
                            />
                        )}

                        {/* Debug edit button */}
                        <button
                            onClick={() => setEditOpen(true)}
                            className="ml-2 px-4 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600"
                        >
                            Debug: Edit
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold">{user.username}</h1>
                        <p className="text-gray-600 dark:text-gray-400">@{user.handle}</p>

                        {/* Bio - force display even if empty for debugging */}
                        <div className="mt-3">
                            {user.bio ? (
                                <p>{user.bio}</p>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic">No bio</p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                                <Calendar size={16} className="mr-1" />
                                <span>
                                    Joined{' '}
                                    {formatDistanceToNow(new Date(user.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <FollowStats userId={user.id} />
                        </div>
                    </div>

                    {/* Posts Tab & List */}
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

                    {posts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            {user.username} hasn&apos;t posted anything yet.
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="mb-6">
                                <Link href={`/posts/${post.id}`}>
                                    <div className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        <p className="mb-2">{post.text}</p>
                                        {post.images && (
                                            <Image
                                                src={JSON.parse(post.images)[0] as string}
                                                alt="Post image"
                                                width={400}
                                                height={250}
                                                className="rounded-lg"
                                            />
                                        )}
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            {post._count.comments} comments · {post._count.likes} likes ·{' '}
                                            {formatDistanceToNow(new Date(post.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}