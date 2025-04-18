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
import { JWT } from 'next-auth/jwt';

// Define a more specific profile type for upsertSocialUser
interface SocialProfile {
    email?: string | null;
    name?: string | null;
    image?: string | null;
}

// Custom token type extending JWT
interface CustomToken extends JWT {
    id?: string;
    picture?: string;
}

// Handle creating/upserting social login users
async function upsertSocialUser(profile: SocialProfile) {
    if (!profile.email) return null;
    const existing = await prisma.user.findUnique({ where: { email: profile.email } });
    if (existing) return existing;

    // Create new user
    const baseHandle = profile.name
        ? profile.name.replace(/\s+/g, '').toLowerCase()
        : profile.email.split('@')[0];
    let handle = baseHandle;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { handle } })) {
        counter++;
        handle = `${baseHandle}${counter}`;
        if (counter > 10) throw new Error('Could not create unique handle');
    }

    return prisma.user.create({
        data: {
            email: profile.email,
            username: profile.name ?? baseHandle,
            handle,
            profileImage: profile.image || undefined,
        },
    });
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
                if (!credentials) return null;
                const parsed = signInSchema.safeParse(credentials);
                if (!parsed.success) return null;
                const { emailOrUsername, password } = parsed.data;

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: emailOrUsername },
                            { username: emailOrUsername },
                            { handle: emailOrUsername.replace(/^@/, '') },
                        ],
                    },
                });
                if (!user?.password) return null;

                const valid = await compare(password, user.password);
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.username,
                    image: user.profileImage,
                    handle: user.handle,
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
        async jwt({ token, user, account, profile }) {
            const customToken = token as CustomToken;
            if (account && user) {
                customToken.id = user.id;
                if (account.provider !== 'credentials' && profile) {
                    const dbUser = await upsertSocialUser({
                        email: profile.email,
                        name: profile.name,
                        image: profile.image,
                    });
                    if (dbUser) customToken.id = dbUser.id;
                }
            }
            return customToken;
        },
        async session({ session, token }) {
            const customToken = token as CustomToken;

            // Only assign if session.user object exists
            if (session.user && customToken.id) {
                (session.user as any).id = customToken.id;
            }

            // Refresh handle, name, image from DB if we have user.id
            const sid = (session.user as any)?.id;
            if (sid) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: sid },
                        select: { handle: true, username: true, profileImage: true },
                    });
                    if (dbUser && session.user) {
                        (session.user as any).handle = dbUser.handle;
                        (session.user as any).name = dbUser.username;
                        (session.user as any).image = dbUser.profileImage;
                    }
                } catch {
                    // ignore errors
                }
            }

            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};
