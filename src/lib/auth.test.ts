import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertSocialUser } from '@/lib/auth';
import prisma from '@/lib/db';

// Mock the prisma client
vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('Auth Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null and log error when upsertSocialUser encounters a database error', async () => {
    const profile = {
      email: 'test@example.com',
      name: 'Test User',
      image: 'http://example.com/image.jpg',
    };

    // Mock console.error to verify it's called
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate a database error (e.g., connection failure)
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'));

    const result = await upsertSocialUser(profile);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error in upsertSocialUser:',
      expect.objectContaining({ message: 'Database connection failed' })
    );

    consoleSpy.mockRestore();
  });

  it('should return null if handle generation fails after 10 retries (infinite loop prevention)', async () => {
      const profile = {
          email: 'loop@example.com',
          name: 'Loop User',
      };
      
      // Mock findUnique to always return a user (simulating taken handles)
      // First call checks email (return null -> not found)
      // Subsequent calls check handle (return object -> found/taken)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValue({ id: 'existing' } as any); // handle check (always taken)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await upsertSocialUser(profile);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Could not create unique handle for social user');
      
      // Should call findUnique 1 (email) + 11 (handle checks) times? 
      // Code: loop runs while counter <= 10. 
      // Initial handle check + 10 retries potentially.
      // actually the logic is:
      // 1. check email
      // 2. check handle (counter=1)
      // 3. if taken, increment, check again...
      // until counter > 10.
      
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(11); 

      consoleSpy.mockRestore();
  });
});
