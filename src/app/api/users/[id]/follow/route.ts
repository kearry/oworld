// src/app/api/users/[id]/follow/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    // Extract the dynamic `id` from the URL
    const { id: targetUserId } = await context.params;

    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cast so TypeScript recognizes `.id`
    const currentUserId = (session.user as { id: string }).id;

    // Prevent following yourself
    if (currentUserId === targetUserId) {
        return NextResponse.json(
            { error: 'Cannot follow yourself' },
            { status: 400 }
        );
    }

    try {
        // Check if already following
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { message: 'Already following' },
                { status: 200 }
            );
        }

        // Create the follow relationship
        const follow = await prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });

        return NextResponse.json({ success: true, follow }, { status: 201 });
    } catch (error) {
        console.error('Error creating follow:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    // Extract the dynamic `id` from the URL
    const { id: targetUserId } = await context.params;

    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cast so TypeScript recognizes `.id`
    const currentUserId = (session.user as { id: string }).id;

    // Prevent unfollowing yourself (optional)
    if (currentUserId === targetUserId) {
        return NextResponse.json(
            { error: 'Cannot unfollow yourself' },
            { status: 400 }
        );
    }

    try {
        // Delete the follow relationship
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting follow:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
