import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/posts/for-you - Get curated posts for the user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Get user's interests (communities they're part of)
        const userCommunities = await prisma.membership.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                communityId: true,
            },
        });

        const communityIds = userCommunities.map(c => c.communityId);

        // Get users they follow
        const following = await prisma.follow.findMany({
            where: {
                followerId: session.user.id,
            },
            select: {
                followingId: true,
            },
        });

        const followingIds = following.map(f => f.followingId);

        // Curate posts based on:
        // 1. Posts from communities they're part of
        // 2. Posts from users they follow
        // 3. Popular posts (high engagement)
        // 4. Recent posts
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { communityId: { in: communityIds.length ? communityIds : undefined } },
                    { authorId: { in: followingIds.length ? followingIds : undefined } },
                    { impressions: { gt: 50 } }, // Popular posts
                ],
                // Exclude posts by blocked users (if implemented)
            },
            take: limit,
            skip,
            orderBy: [
                { impressions: 'desc' }, // Higher impressions first
                { createdAt: 'desc' }, // Then recent posts
            ],
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        handle: true,
                        profileImage: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        // Check if the user has liked each post
        const postsWithLikeStatus = await Promise.all(
            posts.map(async (post) => {
                const like = await prisma.like.findUnique({
                    where: {
                        postId_userId: {
                            postId: post.id,
                            userId: session.user.id,
                        },
                    },
                });

                const bookmark = await prisma.bookmark.findUnique({
                    where: {
                        postId_userId: {
                            postId: post.id,
                            userId: session.user.id,
                        },
                    },
                });

                return {
                    ...post,
                    liked: !!like,
                    bookmarked: !!bookmark,
                };
            })
        );

        // Track impressions for these posts
        await Promise.all(
            posts.map(post =>
                prisma.post.update({
                    where: { id: post.id },
                    data: { impressions: post.impressions + 1 },
                })
            )
        );

        return NextResponse.json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error fetching for-you feed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}