// src/app/api/users/[id]/followers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id: userId } = await context.params;

    try {
        const follows = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
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

        const followers = follows.map(f => f.follower);

        return NextResponse.json({ userId, followers });
    } catch (error) {
        console.error('Error fetching followers:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
