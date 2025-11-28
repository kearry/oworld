import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UIProvider, useUI } from '@/context/ui-context';
import React from 'react';

// Mock React components/hooks if needed, but here we want to test the context logic
// We need to mock the DOM environment to simulate missing localStorage

describe('UIContext LocalStorage Safety', () => {
    const originalWindow = global.window;

    afterEach(() => {
        global.window = originalWindow;
        vi.restoreAllMocks();
    });

    it('should not crash if localStorage is undefined', () => {
        // Simulate environment where localStorage is undefined (like server or some browsers)
        // We can't delete localStorage from JSDOM window easily, but we can mock the getter
        
        const localStorageMock = undefined;
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Use a wrapper to provide the context
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UIProvider>{children}</UIProvider>
        );

        expect(() => {
            renderHook(() => useUI(), { wrapper });
        }).not.toThrow();
    });

    it('should safely handle toggleDarkMode when localStorage is undefined', () => {
         const localStorageMock = undefined;
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UIProvider>{children}</UIProvider>
        );

        const { result } = renderHook(() => useUI(), { wrapper });

        act(() => {
            // This should not throw
            result.current.toggleDarkMode();
        });

        expect(result.current.darkMode).toBe(true); // Toggled from false to true
    });

    it('should not crash if localStorage exists but getItem is not a function', () => {
        // Simulate environment where localStorage is an object but missing methods
        const localStorageMock = {}; 
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UIProvider>{children}</UIProvider>
        );

        expect(() => {
            renderHook(() => useUI(), { wrapper });
        }).not.toThrow();
    });
});
