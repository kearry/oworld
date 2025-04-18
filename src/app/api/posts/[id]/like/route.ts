// src/app/api/posts/[id]/like/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
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
    const session = await getServerSession(authOptions);
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
