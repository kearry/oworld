// src/app/api/users/[id]/following/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    // Await the params promise to get the dynamic `id`
    const { id: userId } = await context.params;

    try {
        // Fetch all follow records where this user is the follower
        const follows = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        handle: true,
                        profileImage: true,
                        bio: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Extract the followed users
        const following = follows.map((f) => f.following);

        // Return JSON response
        return NextResponse.json({ userId, following });
    } catch (error) {
        console.error('Error fetching following list:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
