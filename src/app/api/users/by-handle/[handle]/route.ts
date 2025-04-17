// src/app/api/users/by-handle/[handle]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: Request,
    context: { params: Promise<{ handle: string }> }
) {
    // Await the params object before destructuring
    const { handle: rawHandle } = await context.params;

    if (!rawHandle) {
        return NextResponse.json(
            { error: 'Handle parameter missing' },
            { status: 400 }
        );
    }

    // Strip leading '@' if present
    const handle = rawHandle.startsWith('@')
        ? rawHandle.substring(1)
        : rawHandle;

    try {
        const user = await prisma.user.findFirst({
            where: { handle },
            select: {
                id: true,
                username: true,
                handle: true,
                profileImage: true,
                bio: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (err) {
        console.error('Error fetching user by handle:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}