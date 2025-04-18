// src/app/profile/[handle]/followers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import FollowButton from '@/components/user/FollowButton';

interface Follower {
    id: string;
    username: string;
    handle: string;
    profileImage: string | null;
}

export default function FollowersPage() {
    const params = useParams();
    const router = useRouter();
    const handle = params.handle as string;
    const { data: session, status } = useSession();
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Safely extract current user ID from session
    const currentUserId = session?.user
        ? (session.user as { id: string }).id
        : '';

    // Fetch followers when `handle` changes
    useEffect(() => {
        if (!handle) return;
        setLoading(true);
        setError(null);
        fetch(`/api/users/by-handle/${handle}/followers`)
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error('User not found');
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to load followers');
                }
                return res.json();
            })
            .then((data: Follower[]) => setFollowers(data))
            .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, [handle]);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        // Navigation to sign-in is handled above
        return null;
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto p-4 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Followers of @{handle}
            </h1>

            {followers.length === 0 ? (
                <p className="text-gray-500">No followers yet.</p>
            ) : (
                followers.map((follower) => (
                    <div
                        key={follower.id}
                        className="flex items-center justify-between mb-4"
                    >
                        <Link
                            href={`/profile/${follower.handle}`}
                            className="flex items-center"
                        >
                            <Image
                                src={follower.profileImage ?? '/default-avatar.png'}
                                alt={follower.username}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div className="ml-3">
                                <p className="font-semibold">{follower.username}</p>
                                <p className="text-gray-500">@{follower.handle}</p>
                            </div>
                        </Link>
                        {currentUserId !== follower.id && (
                            <FollowButton userId={follower.id} />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
