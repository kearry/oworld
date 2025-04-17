import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/users/by-handle/[handle] - Get user by handle
export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        let { handle } = params;

        // If handle starts with @, remove it
        if (handle.startsWith('@')) {
            handle = handle.substring(1);
        }

        // Find the user by handle
        const user = await prisma.user.findFirst({
            where: {
                handle: {
                    equals: handle,
                    mode: 'insensitive', // Case insensitive
                },
            },
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
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error getting user by handle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}