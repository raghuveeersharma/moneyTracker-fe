'use client';

import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useDispatch } from 'react-redux';
import { apiSlice } from '../features/api/apiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import { useRouter } from 'next/navigation';

export default function GlobalSocketListener() {
    const socket = useSocket();
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message: any) => {
            console.log('Global listener received message:', message);
            // Invalidate 'Friend' tag to refetch friends list (and unread counts)
            dispatch(apiSlice.util.invalidateTags(['Friend']));

            // Optionally invalidate 'Message' tag if we want to ensure message lists are fresh everywhere
            // But ChatPage handles its own specific cache updates or local state, so this might be redundant for open chats
            // acting as a safeguard though.
            // acting as a safeguard though.
            dispatch(apiSlice.util.invalidateTags(['Message']));

            // Show notification if window is hidden and message is not from us
            if (user && message.senderId !== user._id) {
                if ('Notification' in window && Notification.permission === 'granted') {
                    if (document.hidden) {
                        const notification = new Notification('New Message', {
                            body: message.content,
                            icon: '/favicon.ico',
                            tag: 'chat-message'
                        });

                        notification.onclick = () => {
                            window.focus();
                            router.push('/dashboard/chat');
                            notification.close();
                        };
                    }
                }
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, dispatch]);

    return null;
}
