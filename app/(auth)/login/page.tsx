'use client';

import { useState, useEffect } from 'react';
import { useLoginMutation } from '../../../features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../../features/auth/authSlice';
import { RootState } from '../../../store';
import { useRouter } from 'next/navigation';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading, error }] = useLoginMutation();
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
            const userData = await login({ email, password }).unwrap();
            dispatch(setCredentials(userData));
            router.push('/dashboard');
        } catch (err) {
            console.error('Failed to login:', err);
        }
    };

    // Don't render form if already logged in
    if (token) {
        return null;
    }

    return (
        <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" align="center" fontWeight="bold">Welcome Back</Typography>

                {error && (
                    <Alert severity="error">
                        {(error as any)?.data?.message || 'Login failed'}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <Typography align="center" variant="body2" color="text.secondary">
                    Don't have an account? <Link href="/register" style={{ color: '#6C63FF' }}>Sign up</Link>
                </Typography>
            </Paper>
        </Container>
    );
}
