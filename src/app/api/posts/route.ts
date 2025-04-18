// src/app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { postCreateSchema } from '@/lib/validations';

export async function GET(request: NextRequest): Promise<NextResponse> {
    // Support pagination via ?page=1
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get('page') ?? '1'), 1);
    const take = 10;
    const skip = (page - 1) * take;

    try {
        const posts = await prisma.post.findMany({
            skip,
            take,
            include: {
                author: {
                    select: { id: true, username: true, handle: true, profileImage: true },
                },
                _count: {
                    select: { comments: true, likes: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Cast so TS recognizes .id
    const userId = (session.user as { id: string }).id;

    // Parse and validate request body
    let data;
    try {
        const body = await request.json();
        const parsed = postCreateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            );
        }
        data = parsed.data;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    try {
        const post = await prisma.post.create({
            data: {
                text: data.text,
                images: data.images,
                authorId: userId,
                communityId: data.communityId,
            },
        });
        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
