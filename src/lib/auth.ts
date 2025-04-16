import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import { compare } from 'bcrypt';
import prisma from './db';
import { signInSchema } from './validations';

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                emailOrUsername: { label: 'Email or Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Validate the credentials with Zod
                const result = signInSchema.safeParse(credentials);

                if (!result.success) {
                    return null;
                }

                const { emailOrUsername, password } = result.data;

                // Check if user exists
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: emailOrUsername },
                            { username: emailOrUsername },
                        ],
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                // Check if password matches
                const passwordValid = await compare(password, user.password);

                if (!passwordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.username,
                    image: user.profileImage,
                };
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_ID!,
            clientSecret: process.env.FACEBOOK_SECRET!,
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_ID!,
            clientSecret: process.env.TWITTER_SECRET!,
            version: '2.0',
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                // If signing in with a social provider, create/update the user
                if (account && account.provider !== 'credentials') {
                    await handleSocialLogin(user, account);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;

                // Fetch additional user info
                const userDetails = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { handle: true, username: true },
                });

                if (userDetails) {
                    session.user.handle = userDetails.handle;
                    session.user.username = userDetails.username;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
};

async function handleSocialLogin(user: any, account: any) {
    const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
    });

    if (!existingUser) {
        // Create a new user with the social provider details
        await prisma.user.create({
            data: {
                email: user.email,
                username: user.name?.replace(/\s+/g, '') || `user_${Date.now()}`,
                handle: `@${user.name?.replace(/\s+/g, '').toLowerCase() || `user_${Date.now()}`}`,
                profileImage: user.image,
            },
        });
    } else if (!existingUser.profileImage && user.image) {
        // Update profile image if not set
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { profileImage: user.image },
        });
    }
}

// Type definition for session to include our custom fields
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            image?: string;
            handle: string;
            username: string;
        };
    }
}