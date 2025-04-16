import { useState, useEffect } from 'react';
import { useFeed } from '@/context/feed-context';
import { useUI } from '@/context/ui-context';
import Image from 'next/image';

export default function TabBar() {
    const { activeTab, setActiveTab, userCommunities } = useFeed();
    const { tabBarVisible } = useUI();
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effects
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`
        sticky z-10 top-0 left-0 w-full bg-white dark:bg-gray-800
        transition-all duration-300 border-b border-gray-200 dark:border-gray-700
        ${tabBarVisible ? 'translate-y-0' : '-translate-y-full'}
        ${isScrolled ? 'shadow-sm' : ''}
      `}
        >
            <div className="flex overflow-x-auto hide-scrollbar p-2">
                <button
                    onClick={() => setActiveTab('for-you')}
                    className={`
            px-4 py-2 whitespace-nowrap font-medium rounded-full
            ${activeTab === 'for-you'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-100'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
          `}
                >
                    For You
                </button>

                <button
                    onClick={() => setActiveTab('following')}
                    className={`
            px-4 py-2 ml-2 whitespace-nowrap font-medium rounded-full
            ${activeTab === 'following'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-100'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
          `}
                >
                    Following
                </button>

                {/* User communities */}
                {userCommunities.map(community => (
                    <button
                        key={community.id}
                        onClick={() => setActiveTab(community.id)}
                        className={`
              flex items-center px-4 py-2 ml-2 whitespace-nowrap font-medium rounded-full
              ${activeTab === community.id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-100'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
                    >
                        {community.image && (
                            <Image
                                src={community.image}
                                alt={community.name}
                                width={20}
                                height={20}
                                className="rounded-full mr-2"
                            />
                        )}
                        {community.name}
                    </button>
                ))}
            </div>
        </div>
    );
}