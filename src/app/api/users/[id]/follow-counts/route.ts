import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/users/[id]/follow-counts - Get follower and following counts for a user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Count followers and following
        const followersCount = await prisma.follow.count({
            where: { followingId: userId },
        });

        const followingCount = await prisma.follow.count({
            where: { followerId: userId },
        });

        return NextResponse.json({
            followers: followersCount,
            following: followingCount,
        });
    } catch (error) {
        console.error('Error getting follow counts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}