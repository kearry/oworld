import { useState } from 'react';
import { PlusIcon, X } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

export default function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-blue-500 text-white 
                 flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Create new post"
            >
                <PlusIcon className="h-6 w-6" />
            </button>

            {isOpen && <CreatePostModal onClose={() => setIsOpen(false)} />}
        </>
    );
}