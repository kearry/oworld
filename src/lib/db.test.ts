import prisma from './db';

describe('Database Connection', () => {
    beforeAll(async () => {
        // Clean up the database before tests
        await prisma.like.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.post.deleteMany();
        await prisma.follow.deleteMany();
        await prisma.membership.deleteMany();
        await prisma.community.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        // Disconnect after tests
        await prisma.$disconnect();
    });

    it('should connect to the database', async () => {
        // Simple test to verify connection
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                username: 'testuser',
                handle: 'testhandle',
            },
        });

        expect(user).toHaveProperty('id');
        expect(user.email).toBe('test@example.com');

        // Clean up
        await prisma.user.delete({
            where: { id: user.id },
        });
    });
});