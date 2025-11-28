import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { safeGetServerSession } from '@/lib/safeSession';

// POST /api/upload - Upload one or more images
export async function POST(request: NextRequest) {
    try {
        const { session, error: sessionError } = await safeGetServerSession();
        if (sessionError) {
            console.error('Session retrieval failed in POST /api/upload:', sessionError);
            return NextResponse.json(
                { error: 'Authentication unavailable' },
                { status: 500 }
            );
        }
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        // Array to store URLs of uploaded files
        const urls: string[] = [];

        // Process each file
        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: `File ${file.name} is not an image` },
                    { status: 400 }
                );
            }

            // Limit file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds 5MB limit` },
                    { status: 400 }
                );
            }

            // Create a unique filename
            const ext = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${ext}`;

            // Save file to uploads directory
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = join(process.cwd(), 'public/uploads');

            // Create uploads directory if it doesn't exist
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            const filePath = join(uploadDir, fileName);

            await writeFile(filePath, buffer);

            // Create URL for the uploaded file
            const url = `/uploads/${fileName}`;
            urls.push(url);
        }

        // Return URLs of uploaded files
        return NextResponse.json({ urls });
    } catch (error) {
        console.error('Error uploading files:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
