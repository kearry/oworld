// src/app/auth/signup/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Github, Facebook, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '@/lib/validations';

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpForm>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpForm) => {
        try {
            setIsLoading(true);
            setError(null);

            // Create user account
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    username: data.username,
                    handle: data.handle,
                    password: data.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create account');
            }

            // Sign in the newly created user
            const signInResult = await signIn('credentials', {
                redirect: false, // Important: handle redirect manually
                emailOrUsername: data.email, // Use email for sign-in after signup
                password: data.password,
            });

            if (signInResult?.error) {
                // Log error but still proceed, user can sign in manually
                console.error("Sign up successful, but auto sign-in failed:", signInResult.error);
                setError(`Account created! Please sign in.`);
                // Redirect to sign-in page with a success message maybe?
                // Or just let them stay here with the error message.
                router.push('/auth/signin?message=Account created, please sign in.');
                return; // Stop execution here
            }

            // Redirect to home page on successful sign-in
            router.replace('/'); // Use replace to avoid back button going to signup
            // router.refresh(); // May not be needed

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during sign up');
            console.error("Sign up error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignIn = (provider: string) => {
        setIsLoading(true); // Show loading indicator during redirect
        signIn(provider, { callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sign up</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Create your SocialApp account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                {...register('username')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="Choose a display name"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="handle"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Handle
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                    @
                                </span>
                                <input
                                    id="handle"
                                    type="text"
                                    autoComplete="off"
                                    {...register('handle')}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-none rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="your unique handle"
                                />
                            </div>
                            {errors.handle && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.handle.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                {...register('password')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="Create a password (min. 8 characters)"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Sign up'
                            )}
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        By signing up, you agree to our Terms of Service and Privacy Policy.
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handleSocialSignIn('github')}
                            disabled={isLoading}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
                            aria-label="Sign up with GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleSocialSignIn('google')}
                            disabled={isLoading}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
                            aria-label="Sign up with Google"
                        >
                            {/* Google SVG */}
                            <svg className="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.15-4.8 2.15-3.6 0-6.5-2.94-6.5-6.5s2.9-6.5 6.5-6.5c1.95 0 3.37.78 4.38 1.73l2.53-2.38C18.17 2.18 15.8 1 12.48 1 7.03 1 3.1 4.83 3.1 10s3.93 9 9.38 9c2.7 0 4.7-1 6.17-2.43 1.57-1.53 2.24-3.8 2.24-6.3v-.5h-10.7z" fill="#4285F4" /></svg>
                        </button>
                        <button
                            onClick={() => handleSocialSignIn('facebook')}
                            disabled={isLoading}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
                            aria-label="Sign up with Facebook"
                        >
                            <Facebook className="h-5 w-5 text-blue-600" />
                        </button>
                        {/* Add Twitter Button if enabled and configured */}
                        {/*
             <button
              onClick={() => handleSocialSignIn('twitter')}
              disabled={isLoading}
              className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
              aria-label="Sign up with Twitter"
            >
               <svg className="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor"/></svg>
             </button>
             */}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {/* highlight-start */}
                        Already have an account?{' '} {/* Replaced ' with ' */}
                        {/* highlight-end */}
                        <Link
                            href="/auth/signin"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}