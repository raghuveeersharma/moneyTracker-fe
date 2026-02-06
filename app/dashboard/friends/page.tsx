'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    useGetFriendsQuery,
    useGetPendingRequestsQuery,
    useGetSentRequestsQuery,
    useAcceptFriendRequestMutation,
    useRejectFriendRequestMutation,
    useRemoveFriendMutation,
    useLazySearchUsersQuery,
    useSendFriendRequestMutation,
} from '../../../features/friends/friendApi';
import {
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Typography,
    Box,
    TextField,
    Chip,
    Avatar,
    ListItemAvatar,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import MotionWrapper from '../../../components/MotionWrapper';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function FriendsPage() {
    const { data: friends, isLoading: loadingFriends } = useGetFriendsQuery();
    const { data: pendingRequests } = useGetPendingRequestsQuery();
    const { data: sentRequests } = useGetSentRequestsQuery();

    const [acceptRequest] = useAcceptFriendRequestMutation();
    const [rejectRequest] = useRejectFriendRequestMutation();
    const [removeFriend] = useRemoveFriendMutation();
    const [sendRequest] = useSendFriendRequestMutation();
    const [searchUsers, { data: searchResults, isFetching: searching }] = useLazySearchUsersQuery();

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Auto-search when debounced value changes
    useEffect(() => {
        if (debouncedSearch.trim()) {
            searchUsers(debouncedSearch);
        }
    }, [debouncedSearch, searchUsers]);

    // Check friendship status for a user
    const getFriendshipStatus = (userId: string): 'friend' | 'pending_sent' | 'pending_received' | 'none' => {
        if (friends?.some(f => f._id === userId)) return 'friend';
        if (sentRequests?.some(r => r.recipient._id === userId)) return 'pending_sent';
        if (pendingRequests?.some(r => r.requester._id === userId)) return 'pending_received';
        return 'none';
    };

    // Render action button based on status
    const renderActionButton = (userId: string) => {
        const status = getFriendshipStatus(userId);

        switch (status) {
            case 'friend':
                return <Chip icon={<PeopleIcon />} label="Friends" color="success" variant="outlined" />;
            case 'pending_sent':
                return <Chip icon={<HourglassEmptyIcon />} label="Request Sent" color="warning" variant="outlined" />;
            case 'pending_received':
                return (
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => {
                            const req = pendingRequests?.find(r => r.requester._id === userId);
                            if (req) acceptRequest(req._id);
                        }}
                    >
                        Accept Request
                    </Button>
                );
            default:
                return (
                    <Button variant="outlined" size="small" startIcon={<PersonAddIcon />} onClick={() => sendRequest(userId)}>
                        Add Friend
                    </Button>
                );
        }
    };

    return (
        <MotionWrapper>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Friends
            </Typography>

            {/* Search Users Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Find Users
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Start typing to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searching ? (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        ) : null,
                    }}
                    sx={{ mb: 2 }}
                />
                {searchQuery.trim() && searchResults && searchResults.length > 0 && (
                    <List>
                        {searchResults.map((user) => (
                            <ListItem key={user._id}>
                                <ListItemAvatar>
                                    <Avatar>{user.username[0].toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={user.username} secondary={user.email} />
                                <ListItemSecondaryAction>
                                    {renderActionButton(user._id)}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
                {searchQuery.trim() && searchResults && searchResults.length === 0 && !searching && (
                    <Typography color="text.secondary">No users found</Typography>
                )}
            </Paper>

            {/* Pending Requests */}
            {pendingRequests && pendingRequests.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Pending Requests
                        <Chip label={pendingRequests.length} size="small" sx={{ ml: 1 }} color="warning" />
                    </Typography>
                    <List>
                        {pendingRequests.map((req) => (
                            <ListItem key={req._id}>
                                <ListItemAvatar>
                                    <Avatar>{req.requester.username[0].toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={req.requester.username} secondary={req.requester.email} />
                                <ListItemSecondaryAction>
                                    <IconButton color="success" onClick={() => acceptRequest(req._id)}><CheckIcon /></IconButton>
                                    <IconButton color="error" onClick={() => rejectRequest(req._id)}><CloseIcon /></IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Sent Requests */}
            {sentRequests && sentRequests.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Sent Requests</Typography>
                    <List>
                        {sentRequests.map((req) => (
                            <ListItem key={req._id}>
                                <ListItemAvatar>
                                    <Avatar>{req.recipient.username[0].toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={req.recipient.username} secondary="Pending..." />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Friends List */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    My Friends
                    {friends && <Chip label={friends.length} size="small" sx={{ ml: 1 }} color="primary" />}
                </Typography>
                {loadingFriends ? (
                    <CircularProgress />
                ) : friends && friends.length > 0 ? (
                    <List>
                        {friends.map((friend) => (
                            <ListItem key={friend._id} divider>
                                <ListItemAvatar>
                                    <Avatar>{friend.username[0].toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={friend.username} secondary={friend.email} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" color="error" onClick={() => removeFriend(friend.friendshipId)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography color="text.secondary">No friends yet. Search for users above!</Typography>
                )}
            </Paper>
        </MotionWrapper>
    );
}
