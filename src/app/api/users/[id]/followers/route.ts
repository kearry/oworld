// src/app/api/users/[id]/followers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID parameter is missing' },
                { status: 400 }
            );
        }

        // Fetch follower records
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
                    },
                },
            },
        });

        // Return the array directly
        const followersArray = follows.map((f) => f.follower);
        return NextResponse.json(followersArray);
    } catch (error) {
        console.error('Error fetching followers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch followers' },
            { status: 500 }
        );
    }
}