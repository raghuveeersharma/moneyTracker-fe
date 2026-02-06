'use client';

import { useState, useEffect } from 'react';
import { useRegisterMutation } from '../../../features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../../features/auth/authSlice';
import { RootState } from '../../../store';
import { useRouter } from 'next/navigation';
import { Container, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [register, { isLoading, error }] = useRegisterMutation();
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useSelector((state: RootState) => state.auth);

    // Redirect if already logged in
    useEffect(() => {
        if (token) {
            router.replace('/dashboard');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userData = await register({ username, email, password }).unwrap();
            dispatch(setCredentials(userData));
            router.push('/dashboard');
        } catch (err) {
            console.error('Failed to register:', err);
        }
    };

    // Don't render form if already logged in
    if (token) {
        return null;
    }

    return (
        <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" align="center" fontWeight="bold">Create Account</Typography>

                {error && (
                    <Alert severity="error">
                        {(error as any)?.data?.message || 'Registration failed'}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isLoading}
                        sx={{ mt: 1 }}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <Typography align="center" variant="body2" color="text.secondary">
                    Already have an account? <Link href="/login" style={{ color: '#6C63FF' }}>Login</Link>
                </Typography>
            </Paper>
        </Container>
    );
}
