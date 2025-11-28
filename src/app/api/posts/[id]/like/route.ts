// src/app/api/posts/[id]/like/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { safeGetServerSession } from '@/lib/safeSession';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { session, error: sessionError } = await safeGetServerSession();
    if (sessionError) {
        console.error('Session retrieval failed in POST /api/posts/[id]/like:', sessionError);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cast so TS knows `session.user.id` exists
    const { id: userId } = session.user as { id: string };
    const { id: postId } = await context.params;

    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: { postId, userId },
            },
        });

        if (existingLike) {
            return NextResponse.json({ message: 'Post already liked' }, { status: 200 });
        }

        const like = await prisma.like.create({
            data: { postId, userId },
        });

        return NextResponse.json({ success: true, like }, { status: 201 });
    } catch (error) {
        console.error('Error creating like:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { session, error: sessionError } = await safeGetServerSession();
    if (sessionError) {
        console.error('Session retrieval failed in DELETE /api/posts/[id]/like:', sessionError);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = session.user as { id: string };
    const { id: postId } = await context.params;

    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: { postId, userId },
            },
        });

        if (!existingLike) {
            return NextResponse.json({ message: 'Like not found' }, { status: 404 });
        }

        await prisma.like.delete({
            where: { postId_userId: { postId, userId } },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting like:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
