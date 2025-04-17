import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// POST /api/users/[id]/follow - Follow a user
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const targetUserId = params.id;
        const currentUserId = session.user.id;

        // Can't follow yourself
        if (targetUserId === currentUserId) {
            return NextResponse.json(
                { error: 'You cannot follow yourself' },
                { status: 400 }
            );
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        if (existingFollow) {
            return NextResponse.json(
                { error: 'Already following this user' },
                { status: 400 }
            );
        }

        // Create follow relationship
        const follow = await prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });

        // Create notification for the target user
        await prisma.notification.create({
            data: {
                type: 'follow',
                userId: targetUserId, // Who receives the notification
                sourceId: currentUserId, // Who triggered the notification
            },
        });

        // Update user metrics if they exist
        const userMetrics = await prisma.userMetrics.findUnique({
            where: { userId: targetUserId },
        });

        if (userMetrics) {
            await prisma.userMetrics.update({
                where: { userId: targetUserId },
                data: {
                    followersGrowth: userMetrics.followersGrowth + 1,
                },
            });
        } else {
            // Create metrics if they don't exist
            await prisma.userMetrics.create({
                data: {
                    userId: targetUserId,
                    followersGrowth: 1,
                },
            });
        }

        return NextResponse.json(follow, { status: 201 });
    } catch (error) {
        console.error('Error following user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const targetUserId = params.id;
        const currentUserId = session.user.id;

        // Check if the relationship exists
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        if (!existingFollow) {
            return NextResponse.json(
                { error: 'You are not following this user' },
                { status: 404 }
            );
        }

        // Delete the follow relationship
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        // Update user metrics if they exist
        const userMetrics = await prisma.userMetrics.findUnique({
            where: { userId: targetUserId },
        });

        if (userMetrics && userMetrics.followersGrowth > 0) {
            await prisma.userMetrics.update({
                where: { userId: targetUserId },
                data: {
                    followersGrowth: userMetrics.followersGrowth - 1,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}