// src/hooks/useFollowUser.ts
import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseFollowUserResult {
    isFollowing: boolean;
    isLoading: boolean;
    error: string | null;
    toggleFollow: () => Promise<void>;
}

export default function useFollowUser(
    userId: string,
    initialFollowState = false
): UseFollowUserResult {
    const { data: session } = useSession();
    const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowState);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Safely extract current user's ID from session
    const currentUserId = session?.user
        ? (session.user as { id: string }).id
        : null;

    const toggleFollow = useCallback(async () => {
        if (!session?.user) {
            setError('You must be signed in to follow users');
            return;
        }

        // Don't allow following self
        if (currentUserId === userId) {
            setError('You cannot follow yourself');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const method = isFollowing ? 'DELETE' : 'POST';
            const response = await fetch(`/api/users/${userId}/follow`, {
                method,
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update follow status');
            }

            setIsFollowing(!isFollowing);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error toggling follow:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, isFollowing, session?.user, userId]);

    return {
        isFollowing,
        isLoading,
        error,
        toggleFollow,
    };
}
