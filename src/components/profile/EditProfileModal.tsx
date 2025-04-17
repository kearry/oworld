import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userUpdateSchema } from '@/lib/validations';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

// Derive TS type from Zod schema
type FormData = z.infer<typeof userUpdateSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        username: string;
        handle: string;
        profileImage?: string;
        bio?: string;
    };
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const { data: session } = useSession();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            username: user.username,
            handle: user.handle,
            profileImage: user.profileImage || '',
            bio: user.bio || ''
        }
    });

    const onSubmit = async (values: FormData) => {
        if (!session?.user) {
            toast.error('You must be signed in to update your profile');
            return;
        }

        try {
            const resp = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            if (!resp.ok) {
                const { message } = await resp.json();
                throw new Error(message || 'Failed to update profile');
            }

            toast.success('Profile updated!');
            onClose();
            // Optionally refresh page or session
        } catch (err) {
            console.error('Profile update error:', err);
            toast.error(err instanceof Error ? err.message : 'Unexpected error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <Input
                        {...register('username')}
                        placeholder="Your display name"
                        disabled={isSubmitting}
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Handle</label>
                    <Input
                        {...register('handle')}
                        placeholder="yourhandle"
                        disabled={isSubmitting}
                    />
                    {errors.handle && <p className="text-red-500 text-sm mt-1">{errors.handle.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Profile Image URL</label>
                    <Input
                        {...register('profileImage')}
                        placeholder="https://..."
                        disabled={isSubmitting}
                    />
                    {errors.profileImage && <p className="text-red-500 text-sm mt-1">{errors.profileImage.message}</p>}
                    {user.profileImage && (
                        <img
                            src={user.profileImage}
                            alt="Profile preview"
                            className="w-16 h-16 rounded-full mt-2"
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        {...register('bio')}
                        placeholder="Tell us about yourself"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                    />
                    {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
                </div>

                <div className="flex justify-end">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="mr-2">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
