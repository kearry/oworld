// src/components/providers/ThemeSync.tsx
'use client';

import { useUI } from '@/context/ui-context';
import { useEffect } from 'react';

export default function ThemeSync() {
    const { darkMode } = useUI();

    useEffect(() => {
        // Toggle the `dark` class on <html> on every change
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return null; // no visual output
}