// src/app/api/users/by-handle/[handle]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ handle: string }> }
): Promise<NextResponse> {
    // Await the params promise to extract the dynamic `handle`
    const { handle } = await context.params;

    try {
        // Fetch the user by handle, selecting only public fields
        const user = await prisma.user.findUnique({
            where: { handle },
            select: {
                id: true,
                email: true,
                username: true,
                handle: true,
                profileImage: true,
                bio: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            // Return 404 if no user found with that handle
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return the user data as JSON
        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user by handle:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
