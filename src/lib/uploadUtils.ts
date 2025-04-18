/**
 * Utility functions for handling file uploads
 */

/**
 * Upload an image to the server
 * @param file The file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    // Limit file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
    }

    const formData = new FormData();
    formData.append('images', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    if (!data.urls || data.urls.length === 0) {
        throw new Error('No URL returned from upload');
    }

    // Return full URL
    return window.location.origin + data.urls[0];
}