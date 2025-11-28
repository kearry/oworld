import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { safeGetServerSession } from '@/lib/safeSession';

export async function GET() {
    const { session, error } = await safeGetServerSession();
    if (error) {
        console.error('Session retrieval failed in GET /api/communities/user:', error);
        return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    try {
        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: { community: true },
            orderBy: { community: { name: 'asc' } },
        });

        const communities = memberships.map(m => m.community);
        return NextResponse.json(communities, { status: 200 });
    } catch (err) {
        console.error('Error fetching user communities:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
