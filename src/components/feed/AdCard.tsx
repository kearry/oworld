import Image from 'next/image';
import Link from 'next/link';
import { Advertisement } from '@/lib/validations';
import { Info } from 'lucide-react';

interface AdCardProps {
    ad: Advertisement;
}

export default function AdCard({ ad }: AdCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Info size={12} className="mr-1" />
                    Sponsored
                </span>
            </div>

            <h3 className="text-lg font-bold mb-2">{ad.title}</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-3">{ad.content}</p>

            {ad.imageUrl && (
                <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                    <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            )}

            {ad.link && (
                <Link
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                    Learn More
                </Link>
            )}
        </div>
    );
}