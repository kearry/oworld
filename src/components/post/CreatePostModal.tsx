// src/components/post/CreatePostModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { X, ImageIcon, Smile, MapPin, Loader2 } from 'lucide-react';
import { useFeed } from '@/context/feed-context';
import { postCreateSchema } from '@/lib/validations';
import { toast } from 'react-hot-toast';

interface CreatePostModalProps {
    onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
    const { data: session } = useSession();
    const { refreshFeed } = useFeed();

    // Safely extract the current user ID
    const currentUserId = session?.user
        ? (session.user as { id: string }).id
        : '';

    const [text, setText] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const maxCharCount = 300;
    const maxImages = 4;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const modalRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [onClose]);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        if (newText.length <= maxCharCount) {
            setText(newText);
            setCharacterCount(newText.length);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const file = files[0];
        if (!file.type.startsWith('image/') || file.size > maxFileSize) {
            toast.error('Please select an image under 5MB');
            return;
        }
        setUploadingImages(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
            setImageUrls((prev) => [...prev, data.url]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Upload error');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        setImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!currentUserId) {
            toast.error('You must be signed in to post');
            return;
        }
        setLoading(true);
        setError(null);

        const trimmedText = text.trim();
        const postData = {
            text: trimmedText,
            authorId: currentUserId,
            ...(imageUrls.length > 0 && { images: JSON.stringify(imageUrls) }),
        };

        const parsed = postCreateSchema.safeParse(postData);
        if (!parsed.success) {
            setError(parsed.error.errors[0]?.message || 'Invalid post data');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed.data),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to create post');
            }
            toast.success('Post created successfully!');
            refreshFeed();
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexpected error';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit =
        !loading &&
        (text.trim().length > 0 || imageUrls.length > 0) &&
        characterCount <= maxCharCount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Create Post
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-3">
                        {session?.user?.image ? (
                            <Image
                                src={session.user.image}
                                alt="User avatar"
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        )}
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={handleTextChange}
                            placeholder="What's happening?"
                            className="w-full bg-transparent outline-none resize-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            rows={4}
                        />
                    </div>

                    {/* Image previews */}
                    {imageUrls.length > 0 && (
                        <div
                            className={`grid gap-2 ${imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                                }`}
                        >
                            {imageUrls.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-square rounded-lg overflow-hidden"
                                >
                                    <Image
                                        src={url}
                                        alt={`Preview ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full text-white hover:bg-opacity-80"
                                        aria-label={`Remove image ${idx + 1}`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                        <label
                            htmlFor="post-image-upload"
                            className={`cursor-pointer p-2 rounded-full ${imageUrls.length >= maxImages || loading
                                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                                }`}
                        >
                            <ImageIcon size={20} />
                            <input
                                id="post-image-upload"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={imageUrls.length >= maxImages || loading}
                            />
                        </label>
                        <button
                            disabled={loading}
                            className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-full"
                            aria-label="Add emoji (coming soon)"
                        >
                            <Smile size={20} />
                        </button>
                        <button
                            disabled={loading}
                            className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-full"
                            aria-label="Add location (coming soon)"
                        >
                            <MapPin size={20} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span
                            className={`text-sm ${characterCount > maxCharCount
                                    ? 'text-red-500'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {characterCount}/{maxCharCount}
                        </span>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={`px-4 py-2 rounded-full font-bold text-white transition-colors duration-200 ${canSubmit
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    {uploadingImages ? 'Uploading...' : 'Posting...'}
                                </div>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
