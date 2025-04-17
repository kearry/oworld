import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const error = searchParams.get('error');

    // Return the error information as JSON
    return NextResponse.json({
        error: error || 'Unknown error',
        description: getErrorDescription(error || '')
    });
}

// Helper function to provide more descriptive error messages
function getErrorDescription(error: string): string {
    switch (error) {
        case 'Configuration':
            return 'There is a problem with the server configuration.';
        case 'AccessDenied':
            return 'You do not have access to this resource.';
        case 'Verification':
            return 'The verification token is invalid or has expired.';
        case 'OAuthSignin':
            return 'Error in OAuth sign-in process.';
        case 'OAuthCallback':
            return 'Error in OAuth callback.';
        case 'OAuthCreateAccount':
            return 'Error creating OAuth account.';
        case 'EmailCreateAccount':
            return 'Error creating email account.';
        case 'Callback':
            return 'Error in callback handler.';
        case 'OAuthAccountNotLinked':
            return 'Email already in use with a different provider.';
        case 'EmailSignin':
            return 'Error sending email for sign-in.';
        case 'CredentialsSignin':
            return 'Invalid credentials.';
        case 'SessionRequired':
            return 'You must be signed in to access this resource.';
        default:
            return 'An unknown error occurred.';
    }
}