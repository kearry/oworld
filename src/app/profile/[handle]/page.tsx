// src/app/profile/[handle]/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2, Calendar, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

import FollowButton from '@/components/user/FollowButton';
import FollowStats from '@/components/user/FollowStats';
import EditProfileModal from '@/components/profile/EditProfileModal';
import PostCard from '@/components/post/PostCard';

interface ProfileUser {
    id: string;
    username: string;
    handle: string;
    profileImage: string | null;
    bio: string | null;
    createdAt: string;
}

interface CompletePost {
    id: string;
    authorId: string;
    text: string;
    images: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        username: string;
        handle: string;
        profileImage: string | null;
    };
    _count: {
        comments: number;
        likes: number;
    };
    impressions: number;
    liked?: boolean;
    bookmarked?: boolean;
    communityId?: string | null;
}

type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const handle = params.handle as string;

    const [user, setUser] = useState<ProfileUser | null>(null);
    const [posts, setPosts] = useState<CompletePost[]>([]);
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const isCurrentUser = useMemo(() => {
        if (sessionStatus !== 'authenticated' || !session?.user || !user) {
            return false;
        }
        const current = session.user as { id: string; handle: string };
        return current.id === user.id || current.handle === user.handle;
    }, [session, sessionStatus, user]);

    const checkFollowStatus = useCallback(
        async (targetUserId: string) => {
            if (
                sessionStatus !== 'authenticated' ||
                !session?.user ||
                (session.user as { id: string }).id === targetUserId
            ) {
                setIsFollowing(false);
                return;
            }
            setIsFollowing(null);
            try {
                const currentUserId = (session.user as { id: string }).id;
                const res = await fetch(
                    `/api/users/${currentUserId}/follows/${targetUserId}`
                );
                if (!res.ok) throw new Error('Failed to check follow status');
                const { isFollowing } = await res.json();
                setIsFollowing(isFollowing);
            } catch {
                setIsFollowing(false);
            }
        },
        [session, sessionStatus]
    );

    const fetchUserData = useCallback(async () => {
        if (!handle) return;
        setLoadingProfile(true);
        setProfileError(null);
        setUser(null);
        setIsFollowing(null);

        try {
            const res = await fetch(`/api/users/by-handle/${handle}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error('User not found');
                throw new Error('Failed to load profile');
            }
            const data: ProfileUser = await res.json();
            setUser(data);
            await checkFollowStatus(data.id);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error loading profile';
            setProfileError(msg);
            toast.error(msg);
        } finally {
            setLoadingProfile(false);
        }
    }, [handle, checkFollowStatus]);

    const fetchProfileContent = useCallback(
        async (userId: string, tab: ProfileTab) => {
            setLoadingPosts(true);
            setPostsError(null);
            setPosts([]);

            if (tab !== 'posts') {
                setPostsError(
                    `${tab.charAt(0).toUpperCase() + tab.slice(1)} not implemented`
                );
                setLoadingPosts(false);
                return;
            }

            try {
                const res = await fetch(`/api/users/${userId}/posts`);
                if (!res.ok) throw new Error('Failed to load posts');
                const data: CompletePost[] = await res.json();
                setPosts(data);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Error loading posts';
                setPostsError(msg);
                toast.error(msg);
            } finally {
                setLoadingPosts(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        if (user?.id) {
            fetchProfileContent(user.id, activeTab);
        }
    }, [user, activeTab, fetchProfileContent]);

    useEffect(() => {
        if (sessionStatus === 'unauthenticated') {
            router.replace('/auth/signin');
        }
    }, [sessionStatus, router]);

    if (loadingProfile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (profileError || !user) {
        return (
            <div className="max-w-md mx-auto p-4 text-center">
                <div className="bg-red-100 dark:bg-red-900/50 p-6 rounded-lg text-red-700 dark:text-red-200">
                    <h2 className="text-xl font-semibold">Error</h2>
                    <p>{profileError || 'Unable to load profile.'}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const joinDate = format(new Date(user.createdAt), 'MMMM yyyy');

    return (
        <>
            <EditProfileModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                user={{
                    id: user.id,
                    username: user.username,
                    handle: user.handle,
                    profileImage: user.profileImage ?? undefined,
                    bio: user.bio ?? undefined,
                }}
                onProfileUpdate={fetchUserData}
            />

            <div className="max-w-2xl mx-auto pb-16">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-900 relative mb-16">
                    <div className="absolute -bottom-12 left-4">
                        <Image
                            src={user.profileImage ?? '/default-avatar.png'}
                            alt={user.username}
                            width={80}
                            height={80}
                            className="rounded-full border-4 border-white dark:border-black"
                        />
                    </div>
                </div>

                <div className="pl-32">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            <p className="text-gray-500 dark:text-gray-400">@{user.handle}</p>
                        </div>
                        {isCurrentUser ? (
                            <button
                                onClick={() => setEditOpen(true)}
                                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Edit className="inline mr-1" />
                                Edit Profile
                            </button>
                        ) : (
                            <FollowButton
                                userId={user.id}
                                initialFollowing={!!isFollowing}
                                onFollowChange={setIsFollowing}
                            />
                        )}
                    </div>

                    <p className="mt-4">{user.bio}</p>
                    <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-2" /> Joined {joinDate}
                    </div>

                    <FollowStats
                        userId={user.id}
                        className="mt-4"
                        showLinks={!isCurrentUser}
                    />
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex justify-around">
                        {(['posts', 'replies', 'media', 'likes'] as ProfileTab[]).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-center capitalize border-b-2 ${activeTab === tab
                                            ? 'border-blue-500 text-blue-500'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className="min-h-[200px]">
                    {loadingPosts ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : postsError ? (
                        <div className="text-center py-10 text-red-600 dark:text-red-400">
                            {postsError}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            {user.username} has no {activeTab} yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={{
                                        ...post,
                                        createdAt: new Date(post.createdAt),
                                        updatedAt: new Date(post.updatedAt),
                                        images: post.images ?? undefined,
                                        communityId: post.communityId ?? undefined,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
