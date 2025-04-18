// src/app/api/posts/for-you/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(): Promise<NextResponse> {
    // Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Tell TS that session.user.id definitely exists
    const userId = (session.user as { id: string }).id;

    try {
        // Find communities the user belongs to
        const memberships = await prisma.membership.findMany({
            where: { userId },
            select: { communityId: true },
        });
        const communityIds = memberships.map((m) => m.communityId);

        // Fetch posts in those communities (or all posts if none)
        const posts = await prisma.post.findMany({
            where: communityIds.length
                ? { communityId: { in: communityIds } }
                : {},
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
        console.error('Error fetching for-you posts:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
