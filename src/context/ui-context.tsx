// src/context/ui-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

type UIContextType = {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    tabBarVisible: boolean;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [tabBarVisible, setTabBarVisible] = useState(true);
    const pathname = usePathname();

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        try {
            if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
                window.localStorage.setItem('darkMode', newMode.toString());
            }
        } catch { }
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // On mount, initialize from localStorage
    useEffect(() => {
        let saved = false;
        try {
            if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
                saved = window.localStorage.getItem('darkMode') === 'true';
            }
        } catch { }
        if (saved) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Hide/show tab bar on scroll
    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            setTabBarVisible(scrollPosition > current || current < 50);
            setScrollPosition(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollPosition]);

    // Adjust sidebar for mobile vs. desktop
    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile sidebar on navigation
    useEffect(() => {
        if (window.innerWidth < 768) setSidebarOpen(false);
    }, [pathname]);

    return (
        <UIContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                toggleSidebar,
                darkMode,
                toggleDarkMode,
                tabBarVisible,
            }}
        >
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}