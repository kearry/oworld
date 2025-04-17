'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string>('An unknown error occurred');
    const [errorDescription, setErrorDescription] = useState<string>('');

    useEffect(() => {
        const error = searchParams.get('error');

        if (error) {
            switch (error) {
                case 'Configuration':
                    setErrorMessage('Server Configuration Error');
                    setErrorDescription('There is a problem with the server configuration. Please contact support.');
                    break;
                case 'AccessDenied':
                    setErrorMessage('Access Denied');
                    setErrorDescription('You do not have access to this resource.');
                    break;
                case 'Verification':
                    setErrorMessage('Verification Failed');
                    setErrorDescription('The verification token is invalid or has expired.');
                    break;
                case 'OAuthSignin':
                    setErrorMessage('OAuth Sign In Error');
                    setErrorDescription('An error occurred during the OAuth sign-in process.');
                    break;
                case 'OAuthCallback':
                    setErrorMessage('OAuth Callback Error');
                    setErrorDescription('An error occurred during the OAuth callback process.');
                    break;
                case 'OAuthCreateAccount':
                    setErrorMessage('Account Creation Error');
                    setErrorDescription('An error occurred while creating your account with this OAuth provider.');
                    break;
                case 'EmailCreateAccount':
                    setErrorMessage('Account Creation Error');
                    setErrorDescription('An error occurred while creating your account with this email.');
                    break;
                case 'Callback':
                    setErrorMessage('Callback Error');
                    setErrorDescription('An error occurred during the authentication callback.');
                    break;
                case 'OAuthAccountNotLinked':
                    setErrorMessage('Account Not Linked');
                    setErrorDescription('This email is already associated with another account. Please sign in using the original provider.');
                    break;
                case 'EmailSignin':
                    setErrorMessage('Email Sign In Error');
                    setErrorDescription('An error occurred when sending the email for sign in.');
                    break;
                case 'CredentialsSignin':
                    setErrorMessage('Invalid Credentials');
                    setErrorDescription('The credentials you provided are invalid or the account does not exist.');
                    break;
                case 'SessionRequired':
                    setErrorMessage('Authentication Required');
                    setErrorDescription('You must be signed in to access this resource.');
                    break;
                default:
                    setErrorMessage('Authentication Error');
                    setErrorDescription('An unknown error occurred during authentication.');
            }
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{errorMessage}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{errorDescription}</p>
                </div>

                <div className="flex flex-col space-y-4">
                    <Link
                        href="/auth/signin"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Back to Sign In
                    </Link>

                    <Link
                        href="/"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}