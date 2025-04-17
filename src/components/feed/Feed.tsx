'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFeed } from '@/context/feed-context';
import PostCard from '@/components/post/PostCard';
import AdCard from '@/components/feed/AdCard';
import { Loader2 } from 'lucide-react';
import { Advertisement, Post } from '@/lib/validations';

// Define the complete post type with all properties required by PostCard
interface CompletePost extends Post {
    author: {
        username: string;
        handle: string;
        profileImage: string | null;
    };
    _count: {
        comments: number;
        likes: number;
    };
    liked?: boolean;
    bookmarked?: boolean;
}

export default function Feed() {
    const { posts, loading, error, hasMore, loadMorePosts } = useFeed();
    const [ads, setAds] = useState<Advertisement[]>([]);
    const { ref, inView } = useInView();
    const initialLoadRef = useRef(true);

    // Load more posts when the user scrolls to the bottom
    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMorePosts();
        }
    }, [inView, hasMore, loading, loadMorePosts]);

    // Fetch advertisements for the feed
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await fetch('/api/ads');
                if (response.ok) {
                    const data = await response.json();
                    setAds(data);
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            }
        };

        fetchAds();
    }, []);

    // Wait for initial load to complete
    useEffect(() => {
        if (!loading && initialLoadRef.current) {
            initialLoadRef.current = false;
        }
    }, [loading]);

    // Function to insert ads at specific positions (max 1 ad per 10 posts)
    const getContentWithAds = () => {
        const content: React.ReactNode[] = [];
        let adIndex = 0;

        posts.forEach((post, index) => {
            // Type assertion to ensure post is treated as CompletePost
            // Since we know the API will return the complete structure
            const fullPost = post as unknown as CompletePost;

            // Add post to content
            content.push(
                <PostCard key={post.id} post={fullPost} />
            );

            // Show an ad after every 10 posts
            if ((index + 1) % 10 === 0 && adIndex < ads.length) {
                content.push(
                    <AdCard key={`ad-${adIndex}`} ad={ads[adIndex]} />
                );
                adIndex++;
            }
        });

        return content;
    };

    if (initialLoadRef.current && loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-600 dark:text-red-200">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.length === 0 && !loading ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No posts to show. Follow more people or communities to see content here.
                </div>
            ) : (
                <>
                    {getContentWithAds()}

                    {/* Loading more indicator */}
                    {hasMore && (
                        <div ref={ref} className="flex justify-center p-4">
                            {loading && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
                        </div>
                    )}

                    {/* End of feed message */}
                    {!hasMore && (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            You&apos;ve reached the end of your feed.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}