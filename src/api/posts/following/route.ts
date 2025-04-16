import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/posts/following - Get posts from users the current user follows
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

        // If user doesn't follow anyone, return empty array
        if (followingIds.length === 0) {
            return NextResponse.json([]);
        }

        // Get posts from followed users
        const posts = await prisma.post.findMany({
            where: {
                authorId: { in: followingIds },
            },
            take: limit,
            skip,
            orderBy: {
                createdAt: 'desc', // Most recent first
            },
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
        console.error('Error fetching following feed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}