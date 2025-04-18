// src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    // Await the params promise to extract the dynamic `id`
    const { id: userId } = await context.params;

    try {
        // Fetch the user by ID, selecting only public fields
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
            // Return 404 if user not found
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return the user data as JSON
        return NextResponse.json({ userId, user });
    } catch (error) {
        console.error('Error fetching user:', error);
        // Return generic 500 on failure
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
