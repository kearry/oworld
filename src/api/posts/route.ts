// src/app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { postCreateSchema } from '@/lib/validations';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/posts - Get all posts (paginated)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            take: limit,
            skip,
            orderBy: {
                createdAt: 'desc',
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
        });

        // Get total count for pagination
        const total = await prisma.post.count();

        return NextResponse.json({
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const json = await request.json();

        // Validate with Zod
        const result = postCreateSchema.safeParse(json);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid post data', issues: result.error.issues },
                { status: 400 }
            );
        }

        // Ensure the current user is the author
        if (result.data.authorId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized: cannot create posts for other users' },
                { status: 403 }
            );
        }

        // Create post
        const post = await prisma.post.create({
            data: {
                text: result.data.text,
                images: result.data.images,
                authorId: session.user.id,
                communityId: result.data.communityId,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}