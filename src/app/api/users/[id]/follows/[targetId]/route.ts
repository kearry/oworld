// src/app/api/users/[id]/follows/[targetId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { safeGetServerSession } from '@/lib/safeSession';

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string; targetId: string }> }
): Promise<NextResponse> {
    const { id: userId, targetId } = await context.params;

    const { session, error: sessionError } = await safeGetServerSession();
    if (sessionError) {
        console.error('Session retrieval failed in GET /api/users/[id]/follows/[targetId]:', sessionError);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as { id: string }).id;
    if (sessionUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetId,
                },
            },
        });
        return NextResponse.json({ isFollowing: Boolean(follow) }, { status: 200 });
    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    _request: NextRequest,
    context: { params: Promise<{ id: string; targetId: string }> }
): Promise<NextResponse> {
    const { id: userId, targetId } = await context.params;

    const { session, error: sessionError } = await safeGetServerSession();
    if (sessionError) {
        console.error('Session retrieval failed in POST /api/users/[id]/follows/[targetId]:', sessionError);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as { id: string }).id;
    if (sessionUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userId === targetId) {
        return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    try {
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: { followerId: userId, followingId: targetId },
            },
        });
        if (existing) {
            return NextResponse.json({ message: 'Already following' }, { status: 200 });
        }
        const follow = await prisma.follow.create({
            data: { followerId: userId, followingId: targetId },
        });
        return NextResponse.json({ success: true, follow }, { status: 201 });
    } catch (error) {
        console.error('Error creating follow:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string; targetId: string }> }
): Promise<NextResponse> {
    const { id: userId, targetId } = await context.params;

    const { session, error: sessionError } = await safeGetServerSession();
    if (sessionError) {
        console.error('Session retrieval failed in DELETE /api/users/[id]/follows/[targetId]:', sessionError);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sessionUserId = (session.user as { id: string }).id;
    if (sessionUserId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: { followerId: userId, followingId: targetId },
            },
        });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting follow:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
