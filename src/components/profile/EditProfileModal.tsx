import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userUpdateSchema } from '@/lib/validations';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Loader2, Camera, X } from 'lucide-react';
import { uploadImage } from '@/lib/uploadUtils';

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
    } | null;
    onProfileUpdate?: () => void;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    user,
    onProfileUpdate
}: EditProfileModalProps) {
    const { data: session, update: updateSession } = useSession();
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormData>({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            username: user?.username,
            handle: user?.handle,
            profileImage: user?.profileImage || '',
            bio: user?.bio || ''
        }
    });

    // Watch form values for validation feedback
    const watchedUsername = watch('username');
    const watchedHandle = watch('handle');
    const watchedBio = watch('bio');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploading(true);
            const imageUrl = await uploadImage(files[0]);
            setValue('profileImage', imageUrl, { shouldDirty: true });
            setPreviewImage(imageUrl);
        } catch (err) {
            console.error('Image upload error:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setValue('profileImage', '', { shouldDirty: true });
        setPreviewImage(null);
    };

    const onSubmit = async (values: FormData) => {
        if (!session?.user) {
            toast.error('You must be signed in to update your profile');
            return;
        }

        try {
            const resp = await fetch(`/api/users/${user?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });

            if (!resp.ok) {
                const { error, message } = await resp.json();
                throw new Error(message || error || 'Failed to update profile');
            }

            const updatedUser = await resp.json();

            // Update session data to reflect changes immediately
            await updateSession({
                ...session,
                user: {
                    ...session.user,
                    name: updatedUser.username,
                    image: updatedUser.profileImage,
                    username: updatedUser.username,
                    handle: updatedUser.handle
                }
            });

            toast.success('Profile updated!');

            // Call the callback if provided
            if (onProfileUpdate) {
                onProfileUpdate();
            }

            onClose();
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
                    {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                    {!errors.username && watchedUsername && (
                        <p className="text-green-500 text-sm mt-1">Valid username</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Handle</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            @
                        </span>
                        <Input
                            {...register('handle')}
                            className="rounded-l-none"
                            placeholder="yourhandle"
                            disabled={isSubmitting}
                        />
                    </div>
                    {errors.handle && (
                        <p className="text-red-500 text-sm mt-1">{errors.handle.message}</p>
                    )}
                    {!errors.handle && watchedHandle && (
                        <p className="text-green-500 text-sm mt-1">Valid handle</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Profile Image</label>

                    <div className="flex items-center gap-4 mb-2">
                        {previewImage ? (
                            <div className="relative">
                                <Image
                                    src={previewImage}
                                    alt="Profile preview"
                                    width={80}
                                    height={80}
                                    className="rounded-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <Camera size={24} className="text-gray-500 dark:text-gray-400" />
                            </div>
                        )}

                        <div>
                            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md inline-flex items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isSubmitting || uploading}
                                />
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>Upload Image</>
                                )}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG, or GIF. 5MB max.
                            </p>
                        </div>
                    </div>

                    <Input
                        type="hidden"
                        {...register('profileImage')}
                    />
                    {errors.profileImage && (
                        <p className="text-red-500 text-sm mt-1">{errors.profileImage.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        {...register('bio')}
                        placeholder="Tell us about yourself"
                        rows={3}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        disabled={isSubmitting}
                        maxLength={160}
                    />
                    {errors.bio && (
                        <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                    )}
                    <div className="flex justify-between mt-1">
                        <span className="text-gray-500 text-xs">Max 160 characters</span>
                        <span className="text-gray-500 text-xs">{watchedBio?.length || 0}/160</span>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting || uploading}
                        className="mr-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || uploading || !isDirty}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}