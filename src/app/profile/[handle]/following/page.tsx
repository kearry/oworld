// src/app/profile/[handle]/following/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import FollowButton from '@/components/user/FollowButton';

interface FollowedUser {
    id: string;
    username: string;
    handle: string;
    profileImage: string | null;
}

export default function FollowingPage() {
    const params = useParams();
    const router = useRouter();
    const handle = params.handle as string;
    const { data: session, status } = useSession();
    const [following, setFollowing] = useState<FollowedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Safely extract current user ID
    const currentUserId = session?.user
        ? (session.user as { id: string }).id
        : '';

    // Redirect to sign-in if unauthenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/auth/signin');
        }
    }, [status, router]);

    // Fetch the list of users this profile is following
    useEffect(() => {
        if (!handle) return;
        setLoading(true);
        setError(null);

        // First get the profile user's ID
        fetch(`/api/users/by-handle/${handle}`)
            .then(async (res) => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error('User not found');
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to load profile');
                }
                return res.json();
            })
            .then((user: { id: string }) => {
                // Now fetch following by that user ID
                return fetch(`/api/users/${user.id}/following`);
            })
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to load following list');
                }
                return res.json();
            })
            .then((data: FollowedUser[]) => setFollowing(data))
            .catch((err) => setError(err instanceof Error ? err.message : 'Unknown error'))
            .finally(() => setLoading(false));
    }, [handle]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null; // Redirecting...
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
                Users @{handle} is following
            </h1>

            {following.length === 0 ? (
                <p className="text-gray-500">Not following anyone yet.</p>
            ) : (
                following.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between mb-4"
                    >
                        <Link
                            href={`/profile/${user.handle}`}
                            className="flex items-center"
                        >
                            <Image
                                src={user.profileImage ?? '/default-avatar.png'}
                                alt={user.username}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div className="ml-3">
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-gray-500">@{user.handle}</p>
                            </div>
                        </Link>
                        {currentUserId !== user.id && (
                            <FollowButton userId={user.id} />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
