'use client';

import { AppBar, Toolbar, Typography, Button, Box, Badge } from '@mui/material';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useGetFriendsQuery } from '../features/friends/friendApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { data: friends } = useGetFriendsQuery();

    const unreadChatsCount = friends?.reduce((acc, friend) => {
        return acc + (friend.unreadCount && friend.unreadCount > 0 ? 1 : 0);
    }, 0) || 0;

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    MoneyTracker
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" component={Link} href="/dashboard">Dashboard</Button>
                    <Button color="inherit" component={Link} href="/dashboard/friends">Friends</Button>
                    <Button color="inherit" component={Link} href="/dashboard/transactions">Transactions</Button>
                    <Button color="inherit" component={Link} href="/dashboard/contacts">Contacts</Button>
                    <Button color="inherit" component={Link} href="/dashboard/chat">
                        <Badge badgeContent={unreadChatsCount} color="error">
                            Chat
                        </Badge>
                    </Button>
                    <Button color="inherit" component={Link} href="/dashboard/profile">Profile</Button>
                    <Button color="error" onClick={handleLogout}>Logout</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
