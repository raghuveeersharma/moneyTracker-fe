'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Navbar from '../../components/Navbar';
import { Box, CircularProgress } from '@mui/material';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { token, isInitialized } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    useEffect(() => {
        // Only redirect if auth is initialized and no token exists
        if (isInitialized && !token) {
            router.push('/login');
        }
    }, [token, isInitialized, router]);

    // Show loading while initializing
    if (!isInitialized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // After cleanup, if still no token (and useEffect hasn't redirected yet), show nothing or loading
    if (!token) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <Box sx={{ p: 3 }}>
                {children}
            </Box>
        </Box>
    );
}
