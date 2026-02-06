'use client';

import { useState } from 'react';
import { Autocomplete, TextField, Avatar, Box, Typography } from '@mui/material';
import { useGetFriendsQuery, Friend } from '../features/friends/friendApi';

interface FriendSelectProps {
    value: Friend | null;
    onChange: (friend: Friend | null) => void;
    label?: string;
}

export default function FriendSelect({ value, onChange, label = 'Select Friend' }: FriendSelectProps) {
    const { data: friends, isLoading } = useGetFriendsQuery();

    return (
        <Autocomplete
            options={friends || []}
            loading={isLoading}
            value={value}
            onChange={(_, newValue) => onChange(newValue)}
            getOptionLabel={(option) => option.username}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>{option.username[0].toUpperCase()}</Avatar>
                    <Box>
                        <Typography variant="body2">{option.username}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                    </Box>
                </Box>
            )}
            renderInput={(params) => (
                <TextField {...params} label={label} placeholder="Search friends..." />
            )}
        />
    );
}
