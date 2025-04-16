import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
import { MessageSquare, Repeat, Heart, ChartBar, Bookmark, Share2 } from 'lucide-react';
import { Post } from '@/lib/validations';

interface PostCardProps {
    post: Post & {
        author: {
            username: string;
            handle: string;
            profileImage: string | null;
        };
        _count: {
            comments: number;
            likes: number;
        };
        liked?: boolean;
        bookmarked?: boolean;
    };
}

export default function PostCard({ post }: PostCardProps) {
    const { data: session } = useSession();
    const [liked, setLiked] = useState(post.liked || false);
    const [likeCount, setLikeCount] = useState(post._count.comments || 0);
    const [bookmarked, setBookmarked] = useState(post.bookmarked || false);
    const [imageError, setImageError] = useState<Record<string, boolean>>({});

    const handleLike = async () => {
        if (!session) return;

        try {
            const response = await fetch(`/api/posts/${post.id}/like`, {
                method: liked ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setLiked(!liked);
                setLikeCount(prev => liked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleBookmark = async () => {
        if (!session) return;

        try {
            const response = await fetch(`/api/posts/${post.id}/bookmark`, {
                method: bookmarked ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setBookmarked(!bookmarked);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    // Parse image URLs from JSON string
    const images = post.images ? JSON.parse(post.images) : [];

    return (
        <article className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            {/* Post header */}
            <div className="flex items-start mb-3">
                <Link href={`/profile/${post.author.handle}`} className="flex-shrink-0">
                    <Image
                        src={post.author.profileImage || '/default-avatar.png'}
                        alt={post.author.username}
                        width={48}
                        height={48}
                        className="rounded-full"
                    />
                </Link>

                <div className="ml-3 flex-1">
                    <div className="flex items-center">
                        <Link href={`/profile/${post.author.handle}`} className="font-bold hover:underline">
                            {post.author.username}
                        </Link>
                        <Link href={`/profile/${post.author.handle}`} className="ml-2 text-gray-500 dark:text-gray-400 hover:underline">
                            {post.author.handle}
                        </Link>
                        <span className="mx-1 text-gray-500 dark:text-gray-400">·</span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {/* Post content */}
                    <p className="mt-2 whitespace-pre-wrap break-words">{post.text}</p>

                    {/* Post images */}
                    {images.length > 0 && (
                        <div className={`mt-3 grid gap-2 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {images.map((imageUrl: string, index: number) => (
                                <div key={index} className="relative overflow-hidden rounded-lg">
                                    {!imageError[index] ? (
                                        <Image
                                            src={imageUrl}
                                            alt="Post image"
                                            width={500}
                                            height={imageUrl === images[0] ? 500 : 250}
                                            layout="responsive"
                                            className="object-cover"
                                            onError={() => setImageError(prev => ({ ...prev, [index]: true }))}
                                        />
                                    ) : (
                                        <div className="bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
                                            <span className="text-gray-500 dark:text-gray-400">Image unavailable</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post footer / actions */}
            <div className="flex justify-between mt-3">
                <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500">
                    <MessageSquare size={18} />
                    <span className="ml-2">{post._count.comments || 0}</span>
                </button>

                <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-500">
                    <Repeat size={18} />
                    <span className="ml-2">0</span>
                </button>

                <button
                    onClick={handleLike}
                    className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                        }`}
                >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    <span className="ml-2">{likeCount}</span>
                </button>

                <button className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500">
                    <ChartBar size={18} />
                    <span className="ml-2">{post.impressions}</span>
                </button>

                <div className="flex items-center">
                    <button
                        onClick={handleBookmark}
                        className={`mr-2 ${bookmarked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
                            }`}
                    >
                        <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>

                    <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </article>
    );
}