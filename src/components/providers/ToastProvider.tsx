'use client';
import { Toaster } from 'react-hot-toast';
import { useUI } from '@/context/ui-context';

export default function ToastProvider() {
    const { darkMode } = useUI();

    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Default options for all toasts
                duration: 5000,
                style: {
                    background: darkMode ? '#333' : '#fff',
                    color: darkMode ? '#fff' : '#333',
                },
                // Styles for specific toast types
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#10B981',
                        secondary: 'white',
                    },
                },
                error: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}