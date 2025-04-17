import React from 'react';
import { useSession } from 'next-auth/react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import useFollowUser from '@/hooks/useFollowUser';

interface FollowButtonProps {
    userId: string;
    initialFollowing?: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    variant?: 'default' | 'outline' | 'small';
    className?: string;
}

export default function FollowButton({
    userId,
    initialFollowing = false,
    onFollowChange,
    variant = 'default',
    className = '',
}: FollowButtonProps) {
    const { data: session, status } = useSession();
    const { isFollowing, isLoading, error, toggleFollow } = useFollowUser(userId, initialFollowing);

    // Callback when follow state changes
    React.useEffect(() => {
        if (onFollowChange) {
            onFollowChange(isFollowing);
        }
    }, [isFollowing, onFollowChange]);

    // Handle errors
    React.useEffect(() => {
        if (error) {
            console.error('Follow error:', error);
            // You could show a toast notification here
        }
    }, [error]);

    // Don't render if not authenticated or is the current user
    if (status === 'loading' || !session || session.user.id === userId) {
        return null;
    }

    // Style based on variant
    let buttonStyle = '';

    if (variant === 'default') {
        buttonStyle = isFollowing
            ? 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900 dark:hover:text-red-300'
            : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
    } else if (variant === 'outline') {
        buttonStyle = isFollowing
            ? 'border border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-700 dark:hover:text-red-400'
            : 'border border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20';
    } else if (variant === 'small') {
        buttonStyle = isFollowing
            ? 'text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
            : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300';
    }

    const sizeClass = variant === 'small' ? 'py-1 px-2 text-sm' : 'py-2 px-4';

    return (
        <button
            onClick={toggleFollow}
            disabled={isLoading}
            className={`flex items-center justify-center font-medium rounded-full transition-colors ${sizeClass} ${buttonStyle} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            aria-label={isFollowing ? 'Unfollow' : 'Follow'}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    {variant !== 'small' && 'Following'}
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    {variant !== 'small' && 'Follow'}
                </>
            )}
        </button>
    );
}