import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/ads - Get active advertisements for the feed
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        // Get active ads, prioritized by priority field
        const ads = await prisma.advertisement.findMany({
            where: {
                active: true,
            },
            take: limit,
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json(ads);
    } catch (error) {
        console.error('Error fetching ads:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// For admin use - Create a new advertisement
export async function POST(request: NextRequest) {
    try {
        // In a real application, we would check for admin privileges here

        const json = await request.json();

        const ad = await prisma.advertisement.create({
            data: {
                title: json.title,
                content: json.content,
                imageUrl: json.imageUrl,
                link: json.link,
                active: json.active || true,
                priority: json.priority || 0,
            },
        });

        return NextResponse.json(ad, { status: 201 });
    } catch (error) {
        console.error('Error creating ad:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}