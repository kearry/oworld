import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        // Extract handle from params
        const { handle: rawHandle } = params;

        if (!rawHandle) {
            return NextResponse.json(
                { error: 'Handle parameter missing' },
                { status: 400 }
            );
        }

        // Strip leading '@' if present
        const handle = rawHandle.startsWith('@') ? rawHandle.substring(1) : rawHandle;

        // Query the database
        const user = await prisma.user.findUnique({
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
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user by handle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}