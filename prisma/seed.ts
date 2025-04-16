import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Create demo users
    const adminPassword = await hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            username: 'Admin',
            handle: 'admin',
            password: adminPassword,
            profileImage: 'https://i.pravatar.cc/150?u=admin',
            bio: 'Administrator account',
        },
    });

    const user1Password = await hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'user1@example.com' },
        update: {},
        create: {
            email: 'user1@example.com',
            username: 'Jane Smith',
            handle: 'janesmith',
            password: user1Password,
            profileImage: 'https://i.pravatar.cc/150?u=jane',
            bio: 'Passionate about technology and design',
        },
    });

    const user2Password = await hash('password123', 10);

    const user2 = await prisma.user.upsert({
        where: { email: 'user2@example.com' },
        update: {},
        create: {
            email: 'user2@example.com',
            username: 'John Doe',
            handle: 'johndoe',
            password: user2Password,
            profileImage: 'https://i.pravatar.cc/150?u=john',
            bio: 'Software developer and coffee enthusiast',
        },
    });

    // Create demo communities
    const techCommunity = await prisma.community.upsert({
        where: { name: 'Tech Enthusiasts' },
        update: {},
        create: {
            name: 'Tech Enthusiasts',
            description: 'A community for discussing the latest in technology',
            image: 'https://picsum.photos/seed/tech/300/300',
        },
    });

    const travelCommunity = await prisma.community.upsert({
        where: { name: 'Travel Adventures' },
        update: {},
        create: {
            name: 'Travel Adventures',
            description: 'Share your travel experiences and tips',
            image: 'https://picsum.photos/seed/travel/300/300',
        },
    });

    // Create memberships
    await prisma.membership.create({
        data: {
            userId: user1.id,
            communityId: techCommunity.id,
            role: 'admin',
        },
    });

    await prisma.membership.create({
        data: {
            userId: user2.id,
            communityId: techCommunity.id,
            role: 'member',
        },
    });

    await prisma.membership.create({
        data: {
            userId: user2.id,
            communityId: travelCommunity.id,
            role: 'admin',
        },
    });

    // Create demo posts
    const post1 = await prisma.post.create({
        data: {
            text: 'Just launched our new product! Check it out and let me know what you think.',
            authorId: user1.id,
            communityId: techCommunity.id,
        },
    });

    const post2 = await prisma.post.create({
        data: {
            text: 'Beautiful sunset from my latest trip to Bali. The colors were absolutely incredible!',
            images: JSON.stringify(['https://picsum.photos/seed/bali/800/600']),
            authorId: user2.id,
            communityId: travelCommunity.id,
        },
    });

    const post3 = await prisma.post.create({
        data: {
            text: 'What programming languages are you all learning in 2025? I\'m diving deeper into Rust and loving it so far.',
            authorId: user2.id,
            communityId: techCommunity.id,
        },
    });

    // Create follows
    await prisma.follow.create({
        data: {
            followerId: user1.id,
            followingId: user2.id,
        },
    });

    await prisma.follow.create({
        data: {
            followerId: user2.id,
            followingId: user1.id,
        },
    });

    // Create likes
    await prisma.like.create({
        data: {
            postId: post1.id,
            userId: user2.id,
        },
    });

    await prisma.like.create({
        data: {
            postId: post2.id,
            userId: user1.id,
        },
    });

    // Create comments
    await prisma.comment.create({
        data: {
            text: 'This looks amazing! Can\'t wait to try it out.',
            postId: post1.id,
            authorId: user2.id,
        },
    });

    await prisma.comment.create({
        data: {
            text: 'Wow, what a stunning view! Which beach is this?',
            postId: post2.id,
            authorId: user1.id,
        },
    });

    // Create sample advertisement
    await prisma.advertisement.create({
        data: {
            title: 'Premium Subscription',
            content: 'Unlock all features with our Premium plan. First month 50% off!',
            imageUrl: 'https://picsum.photos/seed/ad1/600/400',
            link: 'https://example.com/premium',
            active: true,
            priority: 10,
        },
    });

    console.log('Database seeded successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });