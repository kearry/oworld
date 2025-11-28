import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { FeedProvider, useFeed } from '@/context/feed-context';

// Mock next-auth session to appear logged in
vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: { user: { id: 'user-1' } },
        status: 'authenticated',
    }),
}));

describe('FeedProvider deduplication', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch as typeof fetch;
        vi.restoreAllMocks();
    });

    function createPost(id: string) {
        return {
            id,
            text: `Post ${id}`,
            images: null,
            authorId: 'author-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            impressions: 0,
            communityId: null,
            author: {
                username: 'Author',
                handle: 'author',
                profileImage: null,
            },
            _count: {
                comments: 0,
                likes: 0,
            },
        };
    }

    it('removes duplicate posts across paginated fetches', async () => {
        const page1 = Array.from({ length: 10 }, (_, i) => createPost(`p${i + 1}`));
        const page2 = [createPost('p10'), createPost('p11')]; // duplicate p10 should be filtered

        const responses = [[], page1, page2]; // communities + page1 + page2
        const fetchMock = vi.fn().mockImplementation(() => {
            const payload = responses.shift() ?? [];
            return Promise.resolve({
                ok: true,
                json: async () => payload,
            });
        });

        global.fetch = fetchMock as unknown as typeof fetch;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <FeedProvider>{children}</FeedProvider>
        );

        const { result } = renderHook(() => useFeed(), { wrapper });

        // Wait for initial load (page 1)
        await waitFor(() => expect(result.current.posts.length).toBe(10));

        // Load next page
        await act(async () => {
            await result.current.loadMorePosts();
        });

        // Wait for page 2 to be merged
        await waitFor(() => expect(result.current.posts.length).toBe(11));

        const ids = result.current.posts.map(p => p.id);
        expect(new Set(ids).size).toBe(ids.length); // all IDs unique
        expect(ids).toContain('p11');
    });

    it('does not loop initial fetches on first render', async () => {
        const page1 = [createPost('p1'), createPost('p2')];
        const responses = [[], page1];
        const fetchMock = vi.fn().mockImplementation(() => {
            const payload = responses.shift() ?? [];
            return Promise.resolve({
                ok: true,
                json: async () => payload,
            });
        });
        global.fetch = fetchMock as unknown as typeof fetch;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <FeedProvider>{children}</FeedProvider>
        );

        const { result } = renderHook(() => useFeed(), { wrapper });

        await waitFor(() => expect(result.current.posts.length).toBe(2));

        // Allow any queued effects to run
        await new Promise(res => setTimeout(res, 10));

        // Should have called communities + first page only
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('stops fetching when page size is under the limit', async () => {
        const page1 = [createPost('p1'), createPost('p2')]; // smaller than PAGE_SIZE (10)
        const responses = [[], page1];
        const fetchMock = vi.fn().mockImplementation(() => {
            const payload = responses.shift() ?? [];
            return Promise.resolve({
                ok: true,
                json: async () => payload,
            });
        });
        global.fetch = fetchMock as unknown as typeof fetch;

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <FeedProvider>{children}</FeedProvider>
        );

        const { result } = renderHook(() => useFeed(), { wrapper });

        await waitFor(() => expect(result.current.posts.length).toBe(2));
        expect(result.current.hasMore).toBe(false);

        // Attempt to load more — should be no-op since hasMore is false
        await act(async () => {
            await result.current.loadMorePosts();
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
