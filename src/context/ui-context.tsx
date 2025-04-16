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
        setDarkMode(prev => !prev);
        // Save preference to localStorage
        localStorage.setItem('darkMode', (!darkMode).toString());
        // Apply dark mode class to html element
        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Handle scroll events for hiding/showing tab bar
    useEffect(() => {
        const handleScroll = () => {
            const currentPosition = window.scrollY;
            setTabBarVisible(scrollPosition > currentPosition || currentPosition < 50);
            setScrollPosition(currentPosition);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollPosition]);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Initialize sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial state

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Reset sidebar state when pathname changes (for mobile)
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
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
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}