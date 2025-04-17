import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface FollowStatsProps {
    userId: string;
    className?: string;
    showLinks?: boolean;
}

export default function FollowStats({ userId, className = '', showLinks = true }: FollowStatsProps) {
    const { handle } = useParams();
    const [counts, setCounts] = useState<{ followers: number; following: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/users/${userId}/follow-counts`);

                if (!response.ok) {
                    throw new Error('Failed to fetch follow counts');
                }

                const data = await response.json();
                setCounts(data);
            } catch (err) {
                console.error('Error fetching follow counts:', err);
                setError('Failed to load follow counts');
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, [userId]);

    if (loading) {
        return (
            <div className={`flex justify-center items-center py-2 ${className}`}>
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !counts) {
        return (
            <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
                Unable to load follow stats
            </div>
        );
    }

    const StatItem = ({ label, count, href }: { label: string; count: number; href: string }) => {
        if (showLinks) {
            return (
                <Link
                    href={href}
                    className="hover:underline flex items-center space-x-1"
                >
                    <span className="font-bold">{count}</span>
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                </Link>
            );
        }

        return (
            <div className="flex items-center space-x-1">
                <span className="font-bold">{count}</span>
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
        );
    };

    return (
        <div className={`flex space-x-4 ${className}`}>
            <StatItem
                label="Followers"
                count={counts.followers}
                href={`/profile/${handle}/followers`}
            />
            <StatItem
                label="Following"
                count={counts.following}
                href={`/profile/${handle}/following`}
            />
        </div>
    );
}