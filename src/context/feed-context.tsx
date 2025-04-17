'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Post, Community } from '@/lib/validations';

type FeedTab = 'for-you' | 'following' | string; // string is for community IDs

type FeedContextType = {
    activeTab: FeedTab;
    setActiveTab: (tab: FeedTab) => void;
    userCommunities: Community[];
    posts: Post[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMorePosts: () => Promise<void>;
    refreshFeed: () => Promise<void>;
};

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { data: session } = useSession();

    // Fetch user's communities
    useEffect(() => {
        if (session?.user.id) {
            fetchUserCommunities();
        }
    }, [session?.user.id]);

    const fetchUserCommunities = async () => {
        try {
            const response = await fetch(`/api/communities/user`);
            if (!response.ok) throw new Error('Failed to fetch communities');

            const data = await response.json();
            setUserCommunities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch communities');
        }
    };

    const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            let endpoint;
            if (activeTab === 'for-you') {
                endpoint = `/api/posts/for-you?page=${pageNum}`;
            } else if (activeTab === 'following') {
                endpoint = `/api/posts/following?page=${pageNum}`;
            } else {
                // Community tab
                endpoint = `/api/communities/${activeTab}/posts?page=${pageNum}`;
            }

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch posts');

            const data = await response.json();

            if (data.length === 0) {
                setHasMore(false);
            } else {
                setPage(pageNum);
                setPosts(prev => (replace ? data : [...prev, ...data]));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, [activeTab, loading]);

    const loadMorePosts = useCallback(async () => {
        if (hasMore && !loading) {
            await fetchPosts(page + 1);
        }
    }, [fetchPosts, hasMore, loading, page]);

    const refreshFeed = useCallback(async () => {
        setPage(1);
        setHasMore(true);
        await fetchPosts(1, true);
    }, [fetchPosts]);

    // Fetch posts when active tab changes
    useEffect(() => {
        if (session?.user.id) {
            refreshFeed();
        }
    }, [activeTab, session?.user.id, refreshFeed]);

    return (
        <FeedContext.Provider
            value={{
                activeTab,
                setActiveTab,
                userCommunities,
                posts,
                loading,
                error,
                hasMore,
                loadMorePosts,
                refreshFeed,
            }}
        >
            {children}
        </FeedContext.Provider>
    );
}

export function useFeed() {
    const context = useContext(FeedContext);
    if (context === undefined) {
        throw new Error('useFeed must be used within a FeedProvider');
    }
    return context;
}