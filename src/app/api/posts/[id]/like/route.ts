import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// POST /api/posts/[id]/like - Like a post
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

        const postId = params.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: session.user.id,
                },
            },
        });

        if (existingLike) {
            return NextResponse.json(
                { error: 'Post already liked' },
                { status: 400 }
            );
        }

        // Create like
        const like = await prisma.like.create({
            data: {
                postId,
                userId: session.user.id,
            },
        });

        // Create notification for post author (if not self-like)
        if (post.authorId !== session.user.id) {
            await prisma.notification.create({
                data: {
                    type: 'like',
                    userId: post.authorId,
                    sourceId: session.user.id,
                    postId,
                },
            });
        }

        return NextResponse.json(like, { status: 201 });
    } catch (error) {
        console.error('Error liking post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/posts/[id]/like - Unlike a post
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

        const postId = params.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Find and delete the like
        const like = await prisma.like.deleteMany({
            where: {
                postId,
                userId: session.user.id,
            },
        });

        if (like.count === 0) {
            return NextResponse.json(
                { error: 'Like not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unliking post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}