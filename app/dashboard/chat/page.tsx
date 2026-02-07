'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import {
    Paper, List, ListItem, ListItemButton, ListItemText, ListItemAvatar,
    Avatar, Typography, TextField, IconButton, Box, Divider, CircularProgress, Chip, Badge
} from '@mui/material';
import { apiSlice } from '../../../features/api/apiSlice';
import { useDispatch } from 'react-redux';
import SendIcon from '@mui/icons-material/Send';
import { useGetFriendsQuery, Friend } from '../../../features/friends/friendApi';
import { useGetMessagesQuery, useSendMessageMutation, useMarkMessagesAsReadMutation, ChatMessage } from '../../../features/messages/messageApi';
import MotionWrapper from '../../../components/MotionWrapper';

export default function ChatPage() {
    const socket = useSocket();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data: friends, isLoading: loadingFriends } = useGetFriendsQuery();

    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [inputText, setInputText] = useState('');
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();

    const [markMessagesAsRead] = useMarkMessagesAsReadMutation();

    // Fetch messages for selected friend
    const { data: serverMessages, isLoading: loadingMessages } = useGetMessagesQuery(
        selectedFriend?._id || '',
        { skip: !selectedFriend }
    );

    const [sendMessage] = useSendMessageMutation();

    // Update local messages when server messages change
    useEffect(() => {
        if (serverMessages) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalMessages(serverMessages);
        }
    }, [serverMessages]);

    // Listen for incoming socket messages
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message: ChatMessage) => {
            console.log('Received message:', message);
            // Only add if it's from OR to the currently selected friend
            // (Use senderId/receiverId instead of from/to)
            const isRelevant =
                (message.senderId === selectedFriend?._id) ||
                (message.receiverId === selectedFriend?._id);

            if (selectedFriend && isRelevant) {
                setLocalMessages((prev) => {
                    // Prevent duplicates
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });

                // If we are looking at this chat, mark as read immediately
                if (message.senderId === selectedFriend._id) {
                    markMessagesAsRead(selectedFriend._id);
                }
            } else {
                // If not relevant (different friend), or no selected friend
                // Refetch friends list to update unread counts
                // We could also do optimistic update but refetch is safer/easier
                dispatch(apiSlice.util.invalidateTags(['Friend']));
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, selectedFriend, dispatch, markMessagesAsRead]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    // Clear messages when switching friends
    // Also mark as read
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalMessages([]);
        if (selectedFriend) {
            markMessagesAsRead(selectedFriend._id);
        }
    }, [selectedFriend?._id, markMessagesAsRead]);

    const handleSend = async () => {
        if (!selectedFriend || !inputText.trim() || !user) {
            console.log('Cannot send:', { selectedFriend: !!selectedFriend, inputText, user: !!user });
            return;
        }

        const content = inputText.trim();
        setInputText('');

        // Optimistically add to local messages
        // Optimistically add to local messages (temporary ID)
        // We will replace this with the real message when it comes back via socket if we want,
        // but for now let's just push it. The socket event might duplicate it if we are not careful.
        // Actually, since we emit from server, we will receive it back.
        // However, for instant feedback, we show it. 
        // We need to deduplicate based on ID or content/timestamp if possible.
        // The server message will have a real MongoID.

        // Strategy: showing optimistic message is good UX.
        // But since we rely on server event now, we might get a duplicate if we don't match them.
        // Simple approach for now: Do NOT add optimistically here if we expect fast server response.
        // OR add it, and when server response comes, simple deduplication relies on ID.
        // But optimistic ID is Date.now(), server ID is ObjectId.

        // Let's rely on the socket event for consistency for now to allow verifying the "real-time" aspect.
        // If it feels slow, we can add optimistic UI later.

        // actually, user wants to see their message immediately.
        // Let's keep optimistic add, but maybe we should rely on the mutation result to update the ID?
        // The `sendMessage` mutation returns the saved message.
        // We can use that to update the list.

        // Update: Removed manual socket emit.
        // We will rely on:
        // 1. Optimistic UI (immediate)
        // 2. API response (confirmation)
        // 3. Socket event (real-time for others, but sender gets it too)

        // The sender receives their OWN message via socket too because we emitted to `req.user.id`.
        // So we will get a duplicate if we have optimistic UI + socket listener.

        // Let's REMOVE strict optimistic UI push here and rely on the socket event from the server
        // to prove the real-time connection works. This is what the user is debugging.
        // If the socket works, the message will appear immediately after DB save.

        // Wait, `sendMessage` mutation invalidates 'Message' tag.
        // `useGetMessagesQuery` might refetch.
        // If we have local state + refetch, it's complex.

        // The current code has a local state `localMessages` initialized from `serverMessages`.
        // If `useGetMessagesQuery` refetches, `useEffect` at line 35 updates `localMessages`.
        // This handles the sender's view.
        // The socket event handles real-time for *others* (and sender if they have other tabs).

        // So for the Sender:
        // 1. Call API.
        // 2. API succeeds, RTK Query cache updates (invalidation).
        // 3. Component re-renders with new list.

        // So we don't technically need to `setLocalMessages` manually if cache invalidation works.
        // BUT `localMessages` is state. `useEffect` syncs it.

        // Let's remove the manual socket emit and the optimistic push to simplify debugging
        // and rely on the Source of Truth (Server).

        // Persist to database
        try {
            await sendMessage({ receiverId: selectedFriend._id, content }).unwrap();
            console.log('Message saved to database');
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    };

    return (
        <MotionWrapper>
            <Paper sx={{ height: '80vh', display: 'flex' }}>
                {/* Friends Sidebar */}
                <Box sx={{ width: 280, borderRight: '1px solid rgba(0,0,0,0.1)', overflow: 'auto' }}>
                    <List>
                        <ListItem>
                            <Typography variant="h6">Chat with Friends</Typography>
                            {socket?.connected && <Chip label="Online" color="success" size="small" sx={{ ml: 1 }} />}
                        </ListItem>
                        <Divider />
                        {loadingFriends && <ListItem><ListItemText primary="Loading..." /></ListItem>}
                        {friends?.length === 0 && (
                            <ListItem>
                                <ListItemText primary="No friends yet" secondary="Add friends to start chatting" />
                            </ListItem>
                        )}
                        {friends?.map((friend) => (
                            <ListItem key={friend._id} disablePadding>
                                <ListItemButton
                                    selected={selectedFriend?._id === friend._id}
                                    onClick={() => setSelectedFriend(friend)}
                                >
                                    <ListItemAvatar>
                                        <Badge badgeContent={friend.unreadCount} color="error">
                                            <Avatar>{friend.username[0].toUpperCase()}</Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText primary={friend.username} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Chat Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedFriend ? (
                        <>
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                                <Typography variant="h6">{selectedFriend.username}</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedFriend.email}</Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                                {loadingMessages ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : localMessages.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                        No messages yet. Say hello!
                                    </Typography>
                                ) : (
                                    localMessages.map((msg) => (
                                        <Box
                                            key={msg._id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: msg.senderId === user?._id ? 'flex-end' : 'flex-start',
                                                mb: 1
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    bgcolor: msg.senderId === user?._id ? 'primary.main' : 'background.paper',
                                                    color: msg.senderId === user?._id ? 'white' : 'text.primary',
                                                    maxWidth: '70%'
                                                }}
                                            >
                                                <Typography variant="body1">{msg.content}</Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', textAlign: 'right' }}>
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </Box>
                            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <IconButton color="primary" onClick={handleSend} disabled={!inputText.trim()}>
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">Select a friend to start chatting</Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </MotionWrapper>
    );
}
