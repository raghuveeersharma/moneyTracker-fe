'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setCredentials } from '../../../features/auth/authSlice';
import { useUpdateProfileMutation } from '../../../features/auth/authApi';
import {
    Paper, Typography, TextField, Button, Box, Alert, Divider, Avatar
} from '@mui/material';
import MotionWrapper from '../../../components/MotionWrapper';

export default function ProfilePage() {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: RootState) => state.auth);
    const [updateProfile, { isLoading, error, isSuccess }] = useUpdateProfileMutation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (user) {
            // Only update if values are unset or different to prevent loop
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsername((prev) => prev || user.username);
            setEmail((prev) => prev || user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (newPassword && newPassword !== confirmPassword) {
            setLocalError('New passwords do not match');
            return;
        }

        try {
            interface UpdateData {
                username?: string;
                email?: string;
                currentPassword?: string;
                newPassword?: string;
            }
            const updateData: UpdateData = {};

            if (username !== user?.username) updateData.username = username;
            if (email !== user?.email) updateData.email = email;
            if (newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            if (Object.keys(updateData).length === 0) {
                setLocalError('No changes to save');
                return;
            }

            const result = await updateProfile(updateData).unwrap();

            // Update local state
            dispatch(setCredentials({
                user: { _id: result._id, username: result.username, email: result.email },
                token: token!,
            }));

            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            console.error('Failed to update profile:', err);
            const errorObj = err as { data?: { message?: string } };
            setLocalError(errorObj?.data?.message || 'Update failed');
        }
    };

    return (
        <MotionWrapper>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Profile Settings
            </Typography>

            <Paper sx={{ p: 4, maxWidth: 500 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                        {user?.username?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{user?.username}</Typography>
                        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {(error || localError) && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {localError || 'Update failed'}
                    </Alert>
                )}

                {isSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Profile updated successfully!
                    </Alert>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Typography variant="subtitle1" fontWeight="bold">Account Information</Typography>

                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        helperText="Username must be unique"
                    />

                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle1" fontWeight="bold">Change Password</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
                        Leave blank to keep current password
                    </Typography>

                    <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        error={!!confirmPassword && newPassword !== confirmPassword}
                        helperText={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 2 }}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </Paper>
        </MotionWrapper>
    );
}
