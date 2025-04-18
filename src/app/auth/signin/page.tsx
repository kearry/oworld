// src/app/auth/signin/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Github, Facebook, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const signInSchema = z.object({
    emailOrUsername: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInForm) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await signIn('credentials', {
                redirect: false,
                emailOrUsername: data.emailOrUsername,
                password: data.password,
            });

            if (result?.error) {
                // Use error message from NextAuth if available, otherwise generic
                setError(result.error === 'CredentialsSignin' ? 'Invalid email/username or password.' : result.error);
                return;
            }

            // Redirect to home page on success
            router.replace('/'); // replace is generally safer after login/logout
        } catch (err) {
            setError('An unexpected error occurred during sign in');
            console.error(err);
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Welcome back to SocialApp
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
                                htmlFor="emailOrUsername"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email or Username
                            </label>
                            <input
                                id="emailOrUsername"
                                type="text"
                                autoComplete="username"
                                {...register('emailOrUsername')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="Enter your email or username"
                            />
                            {errors.emailOrUsername && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.emailOrUsername.message}
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
                                autoComplete="current-password"
                                {...register('password')}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:checked:bg-blue-500"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                            >
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                href="/auth/forgot-password" // Consider implementing this page
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Forgot password?
                            </Link>
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
                                'Sign in'
                            )}
                        </button>
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
                            aria-label="Sign in with GitHub"
                        >
                            <Github className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleSocialSignIn('google')}
                            disabled={isLoading}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
                            aria-label="Sign in with Google"
                        >
                            {/* Google SVG */}
                            <svg className="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.15-4.8 2.15-3.6 0-6.5-2.94-6.5-6.5s2.9-6.5 6.5-6.5c1.95 0 3.37.78 4.38 1.73l2.53-2.38C18.17 2.18 15.8 1 12.48 1 7.03 1 3.1 4.83 3.1 10s3.93 9 9.38 9c2.7 0 4.7-1 6.17-2.43 1.57-1.53 2.24-3.8 2.24-6.3v-.5h-10.7z" fill="#4285F4" /></svg>
                        </button>
                        <button
                            onClick={() => handleSocialSignIn('facebook')}
                            disabled={isLoading}
                            className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
                            aria-label="Sign in with Facebook"
                        >
                            <Facebook className="h-5 w-5 text-blue-600" />
                        </button>
                        {/* Add Twitter Button if enabled and configured */}
                        {/*
             <button
              onClick={() => handleSocialSignIn('twitter')}
              disabled={isLoading}
              className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-75 disabled:cursor-not-allowed"
              aria-label="Sign in with Twitter"
            >
               <svg className="h-5 w-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor"/></svg>
             </button>
             */}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {/* highlight-start */}
                        Don&pos;t have an account?{' '} {/* Replaced ' with ' */}
                        {/* highlight-end */}
                        <Link
                            href="/auth/signup"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}