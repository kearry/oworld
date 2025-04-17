// src/components/ui/Button.tsx
'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    className = '',
    children,
    ...props
}: ButtonProps) {
    const base =
        'px-4 py-2 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    let style = '';
    switch (variant) {
        case 'secondary':
            style =
                'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-500';
            break;
        case 'outline':
            style =
                'border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-500';
            break;
        case 'primary':
        default:
            style = 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500';
    }
    return (
        <button className={`${base} ${style} ${className}`} {...props}>
            {children}
        </button>
    );
}