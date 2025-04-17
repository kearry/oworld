import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/users/[id]/follows/[targetId] - Check if user follows target user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; targetId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id, targetId } = params;

        // If checking if current user follows someone, verify authentication
        if (id === 'me') {
            if (!session?.user) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            // Use the current user's ID
            const userId = session.user.id;

            // Check if the follow relationship exists
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetId,
                    },
                },
            });

            return NextResponse.json({ following: !!follow });
        } else {
            // If checking if any user follows another
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: id,
                        followingId: targetId,
                    },
                },
            });

            return NextResponse.json({ following: !!follow });
        }
    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}