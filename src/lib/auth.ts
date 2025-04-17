// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import { compare } from 'bcrypt';
import prisma from './db';
import { signInSchema } from './validations';

async function upsertSocialUser(profile: {
    email?: string;
    name?: string;
    image?: string;
}) {
    if (!profile.email) return null;
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (user) return user;
    user = await prisma.user.create({
        data: {
            email: profile.email,
            username: profile.name?.replace(/\s+/g, '') ?? `user${Date.now()}`,
            handle:
                profile.name?.replace(/\s+/g, '').toLowerCase() ??
                `user${Date.now()}`,
            profileImage: profile.image,
        },
    });
    return user;
}

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                emailOrUsername: { label: 'Email or Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = signInSchema.safeParse(credentials);
                if (!parsed.success) return null;
                const { emailOrUsername, password } = parsed.data;
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
                    },
                });
                if (!user || !user.password) return null;
                const ok = await compare(password, user.password);
                if (!ok) return null;
                return {
                    id: user.id,
                    email: user.email,
                    name: user.username,
                    image: user.profileImage ?? undefined,
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
            if (account) {
                const dbUser = await upsertSocialUser({
                    email: token.email,
                    name: token.name,
                    image: (token as any).picture ?? (token as any).image,
                });
                if (dbUser) {
                    token.id = dbUser.id;
                }
            } else if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
            }
            let details = null;
            if (token.id) {
                details = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { handle: true, username: true },
                });
            }
            if (!details && session.user.email) {
                details = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    select: { handle: true, username: true },
                });
            }
            if (details) {
                session.user.handle = details.handle;
                session.user.username = details.username;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
};

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