import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/users/[id]/following - Get users followed by the specified user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

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

        // Get users that this user follows
        const follows = await prisma.follow.findMany({
            where: {
                followerId: userId
            },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        handle: true,
                        profileImage: true,
                        bio: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc', // Most recently followed users first
            },
        });

        // Extract following user details
        const following = follows.map(follow => follow.following);

        return NextResponse.json(following);
    } catch (error) {
        console.error('Error getting following:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}