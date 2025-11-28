// src/app/api/posts/following/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { safeGetServerSession } from '@/lib/safeSession';

export async function GET(): Promise<NextResponse> {
    // Get the session
    const { session, error: sessionError } = await safeGetServerSession();
    if (sessionError) {
        console.error('Session retrieval failed in GET /api/posts/following:', sessionError);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cast so TypeScript knows `session.user.id` exists
    const userId = (session.user as { id: string }).id;

    try {
        // Find all user IDs that the current user is following
        const follows = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = follows.map((f) => f.followingId);

        // Fetch recent posts by those users
        const posts = await prisma.post.findMany({
            where: { authorId: { in: followingIds } },
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
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching following posts:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
