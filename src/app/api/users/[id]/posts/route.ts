import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/users/[id]/posts - Get posts by a specific user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
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

        // Get user's posts
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        handle: true,
                        profileImage: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Most recent posts first
            },
            skip,
            take: limit,
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error getting user posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}