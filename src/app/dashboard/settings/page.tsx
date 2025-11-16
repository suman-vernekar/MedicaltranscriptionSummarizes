
'use client';

import { useState, useRef, useEffect } from 'react';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Loader2, Camera, Edit, X, Trash2, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { user, firestore, auth } = useFirebase();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [originalFullName, setOriginalFullName] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if(user) {
        const name = user.displayName || '';
        const avatar = user.photoURL || null;
        setFullName(name);
        setOriginalFullName(name);
        setAvatarPreview(avatar);
        setOriginalAvatar(avatar);
    }
  }, [user]);

  const handleAvatarClick = () => {
    if(isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleCancel = () => {
      setIsEditing(false);
      setFullName(originalFullName);
      setAvatarPreview(originalAvatar);
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !firestore) return;

    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload an image file.',
        });
        return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update Firebase Auth user profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
      }

      // Update Firestore user document
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, { photoURL });
      
      setAvatarPreview(photoURL);
      setOriginalAvatar(photoURL); // Update original avatar on successful upload
      toast({
        title: 'Profile Picture Updated',
        description: 'Your new profile picture has been saved.',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not upload your profile picture. Please try again.',
      });
      // Revert preview if upload fails
      setAvatarPreview(originalAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !auth.currentUser || !firestore) return;
    
    setIsUploading(true);
    try {
        // Remove from Auth
        await updateProfile(auth.currentUser, { photoURL: null });

        // Remove from Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userDocRef, { photoURL: null });

        // Remove from Storage
        const storage = getStorage();
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await deleteObject(storageRef);

        setAvatarPreview(null);
        setOriginalAvatar(null);
        toast({
            title: 'Profile Picture Removed',
            description: 'Your profile picture has been removed.',
        });
    } catch (error: any) {
        // Handle cases where the file might not exist in storage
        if (error.code === 'storage/object-not-found') {
            setAvatarPreview(null);
            setOriginalAvatar(null);
            toast({
                title: 'Profile Picture Removed',
                description: 'Your profile picture has been removed.',
            });
        } else {
            console.error('Error removing profile picture:', error);
            toast({
                variant: 'destructive',
                title: 'Removal Failed',
                description: 'Could not remove your profile picture. Please try again.',
            });
        }
    } finally {
        setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !auth.currentUser || !firestore) return;

    setIsSaving(true);
    try {
        if (fullName !== originalFullName) {
            // Update Firebase Auth display name
            await updateProfile(auth.currentUser, { displayName: fullName });

            // Update Firestore user document
            const userDocRef = doc(firestore, 'users', user.uid);
            updateDocumentNonBlocking(userDocRef, { fullName });
            
            setOriginalFullName(fullName);
        }

        toast({
            title: 'Profile Updated',
            description: 'Your changes have been saved successfully.',
        });
        setIsEditing(false);

    } catch (error) {
        console.error('Error updating profile:', error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update your profile. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !auth.currentUser || !isEditing) return;

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure your new passwords match.',
      });
      return;
    }

    if(newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Password too short',
            description: 'Your new password must be at least 6 characters long.',
        });
        return;
    }

    setIsChangingPassword(true);

    try {
      if (user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);

        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully.',
        });
        
        // Clear password fields and exit edit mode
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      let description = 'Could not change your password. Please try again.';
      if (error.code === 'auth/wrong-password') {
        description = 'The current password you entered is incorrect.';
      } else if (error.code === 'auth/too-many-requests') {
        description = 'Too many attempts. Please try again later.';
      }
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: description,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const getInitials = (nameOrEmail: string | null | undefined) => {
    if (!nameOrEmail) return 'U';
    const parts = nameOrEmail.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  }

  const isFormDirty = fullName !== originalFullName;
  const isPasswordFormDirty = currentPassword || newPassword || confirmPassword;
  const anyFormPending = isSaving || isChangingPassword || isUploading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your public profile settings.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview || ''} alt="User profile" />
                        <AvatarFallback className="text-3xl">
                            {getInitials(user?.displayName || user?.email)}
                        </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <>
                           <div 
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                onClick={handleAvatarClick}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                ) : (
                                    <div className="text-center text-white">
                                        <Upload className="h-8 w-8 mx-auto" />
                                        <span className="text-xs">Upload</span>
                                    </div>
                                )}
                            </div>
                           <Input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={anyFormPending}
                            />
                        </>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        disabled={!isEditing || isSaving}
                        readOnly={!isEditing}
                        className={!isEditing ? "border-transparent bg-transparent p-0 shadow-none focus-visible:ring-0 text-base" : ""}
                    />
                     <p className="text-sm text-muted-foreground">{user?.email}</p>
                     {isEditing && avatarPreview && (
                        <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} disabled={anyFormPending}>
                            <Trash2 className="mr-2 h-4 w-4"/> Remove Photo
                        </Button>
                    )}
                </div>
            </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="justify-end gap-2">
                 <Button type="button" variant="ghost" onClick={handleCancel} disabled={anyFormPending}>
                    Cancel
                 </Button>
                 <Button type="submit" disabled={!isFormDirty || anyFormPending}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Profile
                </Button>
              </CardFooter>
            )}
        </form>
      </Card>
      
      {isEditing && (
        <Card>
            <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your password.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={anyFormPending}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={anyFormPending}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={anyFormPending}
                />
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={anyFormPending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!isPasswordFormDirty || anyFormPending}>
                    {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Change Password
                </Button>
            </CardFooter>
            </form>
        </Card>
      )}
    </div>
  );
}
    
