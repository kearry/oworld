// src/context/feed-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Post, Community } from '@/lib/validations';

// Define the complete post type with all properties required by PostCard
interface CompletePost extends Post {
    author: { username: string; handle: string; profileImage: string | null };
    _count: { comments: number; likes: number };
    liked?: boolean;
    bookmarked?: boolean;
}

type FeedTab = 'for-you' | 'following' | string;

type FeedContextType = {
    activeTab: FeedTab;
    setActiveTab: (tab: FeedTab) => void;
    userCommunities: Community[];
    posts: CompletePost[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMorePosts: () => Promise<void>;
    refreshFeed: () => Promise<void>;
};

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: ReactNode }) {
    const PAGE_SIZE = 10;
    const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [posts, setPosts] = useState<CompletePost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { data: session } = useSession();
    const isFetchingRef = useRef(false);

    // Safely extract current user ID from session
    const currentUserId = session?.user ? (session.user as { id: string }).id : null;

    // Fetch user's communities when session changes
    useEffect(() => {
        if (currentUserId) {
            fetchUserCommunities();
        } else {
            setUserCommunities([]);
        }
    }, [currentUserId]);

    const fetchUserCommunities = async () => {
        try {
            const response = await fetch(`/api/communities/user`);
            if (!response.ok) throw new Error('Failed to fetch communities');
            const data = await response.json();
            setUserCommunities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch communities');
            console.error('Error fetching communities:', err);
        }
    };

    const fetchPosts = useCallback(
        async (pageNum: number, replace = false) => {
            if (isFetchingRef.current) return;
            setLoading(true);
            isFetchingRef.current = true;
            setError(null);
            try {
                let endpoint = '';
                if (activeTab === 'for-you') endpoint = `/api/posts/for-you?page=${pageNum}`;
                else if (activeTab === 'following') endpoint = `/api/posts/following?page=${pageNum}`;
                else endpoint = `/api/communities/${activeTab}/posts?page=${pageNum}`;

                const response = await fetch(endpoint);
                if (!response.ok) throw new Error('Failed to fetch posts');
                const data: CompletePost[] = await response.json();
                if (data.length === 0) {
                    setHasMore(false);
                    if (replace) setPosts([]);
                } else {
                    setPage(pageNum);
                    setPosts(prev => {
                        const combined = replace ? data : [...prev, ...data];
                        const seen = new Set<string>();
                        return combined.filter(item => {
                            if (seen.has(item.id)) return false;
                            seen.add(item.id);
                            return true;
                        });
                    });
                    setHasMore(data.length === PAGE_SIZE);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch posts');
                setHasMore(false);
                console.error(`Error fetching posts:`, err);
            } finally {
                setLoading(false);
                isFetchingRef.current = false;
            }
        },
        [activeTab]
    );

    const loadMorePosts = useCallback(async () => {
        if (hasMore && !isFetchingRef.current) await fetchPosts(page + 1);
    }, [fetchPosts, hasMore, page]);

    const refreshFeed = useCallback(async () => {
        setPage(1);
        setHasMore(true);
        setPosts([]);
        await fetchPosts(1, true);
    }, [fetchPosts]);

    useEffect(() => {
        if (currentUserId) refreshFeed();
        else {
            setPosts([]);
            setPage(1);
            setHasMore(true);
            setError(null);
        }
    }, [activeTab, currentUserId, refreshFeed]);

    return (
        <FeedContext.Provider value={{
            activeTab,
            setActiveTab,
            userCommunities,
            posts,
            loading,
            error,
            hasMore,
            loadMorePosts,
            refreshFeed,
        }}>
            {children}
        </FeedContext.Provider>
    );
}

export function useFeed() {
    const context = useContext(FeedContext);
    if (!context) throw new Error('useFeed must be used within a FeedProvider');
    return context;
}
