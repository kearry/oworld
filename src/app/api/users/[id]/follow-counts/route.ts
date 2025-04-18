// src/app/api/users/[id]/follow-counts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    // Await the params promise to extract `id`
    const { id: userId } = await context.params;

    try {
        // Count how many users follow this user
        const followersCount = await prisma.follow.count({
            where: { followingId: userId },
        });

        // Count how many users this user is following
        const followingCount = await prisma.follow.count({
            where: { followerId: userId },
        });

        // Return the counts as JSON
        return NextResponse.json({
            userId,
            followers: followersCount,
            following: followingCount,
        });
    } catch (error) {
        console.error('Error fetching follow counts:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
