// src/app/api/users/[id]/follow-counts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Await params before accessing its properties
        const { id: userId } = await params;
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID parameter is missing' },
                { status: 400 }
            );
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Count followers
        const followersCount = await prisma.follow.count({
            where: { followingId: userId },
        });

        const followingCount = await prisma.follow.count({
            where: { followerId: userId },
        });
        return NextResponse.json({ followers: followersCount, following: followingCount });
    } catch (error) {
        console.error('Error fetching follower count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch follower count' },
            { status: 500 }
        );
    }
}