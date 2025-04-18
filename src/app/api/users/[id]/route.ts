import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { userUpdateSchema } from '@/lib/validations';

// GET /api/users/[id] - Get user details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                handle: true,
                email: true,
                profileImage: true,
                bio: true,
                createdAt: true,
                updatedAt: true,
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
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user details
export async function PUT(
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

        const userId = params.id;

        // Ensure users can only update their own profiles
        if (session.user.id !== userId) {
            return NextResponse.json(
                { error: 'You can only update your own profile' },
                { status: 403 }
            );
        }

        const json = await request.json();

        // Validate with Zod schema
        const result = userUpdateSchema.safeParse(json);
        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Invalid user data',
                    issues: result.error.issues
                },
                { status: 400 }
            );
        }

        // Check if handle is being changed and if it's unique
        if (result.data.handle) {
            const existingUser = await prisma.user.findUnique({
                where: {
                    handle: result.data.handle,
                    NOT: {
                        id: userId
                    }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Handle is already taken' },
                    { status: 400 }
                );
            }
        }

        // Check if username is being changed and if it's unique
        if (result.data.username) {
            const existingUser = await prisma.user.findUnique({
                where: {
                    username: result.data.username,
                    NOT: {
                        id: userId
                    }
                }
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Username is already taken' },
                    { status: 400 }
                );
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...result.data,
                // Convert empty string bio to null for database storage
                bio: result.data.bio?.trim() === '' ? null : result.data.bio?.trim(),
            },
            select: {
                id: true,
                username: true,
                handle: true,
                email: true,
                profileImage: true,
                bio: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}