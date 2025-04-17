import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { X, ImageIcon, Smile, MapPin, Calendar, BarChart2, Loader2 } from 'lucide-react';
import { useFeed } from '@/context/feed-context';
import { postCreateSchema } from '@/lib/validations';

interface CreatePostModalProps {
    onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
    const { data: session } = useSession();
    const { refreshFeed } = useFeed();
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const maxCharCount = 300;
    const modalRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea on open
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    // Close modal on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Escape key closes modal
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        setCharacterCount(newText.length);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const totalImages = [...images, ...newFiles];

            // Limit to 4 images
            if (totalImages.length > 4) {
                setError('You can only upload up to 4 images');
                return;
            }

            setImages(totalImages);

            // Create object URLs for preview
            const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
            setImageUrls([...imageUrls, ...newImageUrls]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        const newImageUrls = [...imageUrls];

        // Revoke object URL to avoid memory leaks
        URL.revokeObjectURL(newImageUrls[index]);

        newImages.splice(index, 1);
        newImageUrls.splice(index, 1);

        setImages(newImages);
        setImageUrls(newImageUrls);
    };

    const handleSubmit = async () => {
        if (!session?.user) return;

        // Validate text length
        if (text.trim().length === 0) {
            setError('Post cannot be empty');
            return;
        }

        if (text.length > maxCharCount) {
            setError(`Post exceeds maximum character limit of ${maxCharCount}`);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Upload images if any
            let uploadedImageUrls: string[] = [];

            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(image => {
                    formData.append('images', image);
                });

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload images');
                }

                const uploadResult = await uploadResponse.json();
                uploadedImageUrls = uploadResult.urls;
            }

            // Create the post
            const postData = {
                text,
                images: uploadedImageUrls.length > 0 ? JSON.stringify(uploadedImageUrls) : undefined,
                authorId: session.user.id,
            };

            // Validate with Zod
            const result = postCreateSchema.safeParse(postData);

            if (!result.success) {
                setError(result.error.errors[0]?.message || 'Invalid post data');
                return;
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            // Refresh the feed to show the new post
            refreshFeed();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            imageUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageUrls]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Create Post</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-3">
                        {session?.user?.image && (
                            <Image
                                src={session.user.image}
                                alt={session.user.username || 'User'}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        )}

                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={handleTextChange}
                                placeholder="What's happening?"
                                className="w-full min-h-[100px] bg-transparent border-none focus:ring-0 resize-none"
                                maxLength={maxCharCount}
                            />

                            {/* Image previews */}
                            {imageUrls.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative rounded-lg overflow-hidden">
                                            <Image
                                                src={url}
                                                alt={`Selected image ${index + 1}`}
                                                width={200}
                                                height={200}
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex space-x-2">
                            <label htmlFor="image-upload" className="cursor-pointer text-blue-500 hover:text-blue-600">
                                <ImageIcon size={20} />
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>

                            <button className="text-blue-500 hover:text-blue-600">
                                <Smile size={20} />
                            </button>

                            <button className="text-blue-500 hover:text-blue-600">
                                <MapPin size={20} />
                            </button>
                        </div>

                        <div className="text-xs text-gray-500">
                            {characterCount}/{maxCharCount}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || text.trim().length === 0 || text.length > maxCharCount}
                            className={`
                px-4 py-2 rounded-full font-medium
                ${loading || text.trim().length === 0 || text.length > maxCharCount
                                    ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'}
              `}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Posting...
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