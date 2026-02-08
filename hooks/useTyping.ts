import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseTypingProps {
  socket: Socket | null;
  selectedFriendId: string | undefined;
  user: { _id: string } | null;
}

export const useTyping = ({ socket, selectedFriendId, user }: UseTypingProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle incoming typing events
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFriendTyping(false);

    if (!socket) return;

    const handleTyping = (data: { senderId: string }) => {
      console.log('Typing event received:', data);
      if (data.senderId === selectedFriendId) {
        setIsFriendTyping(true);
      }
    };

    const handleStopTyping = (data: { senderId: string }) => {
      console.log('Stop typing event received:', data);
      if (data.senderId === selectedFriendId) {
        setIsFriendTyping(false);
      }
    };

    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, selectedFriendId]);

  // Function to call when user types
  const handleUserTyping = useCallback(() => {
    if (!socket || !selectedFriendId || !user) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { recipientId: selectedFriendId, senderId: user._id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { recipientId: selectedFriendId, senderId: user._id });
    }, 2000);
  }, [socket, selectedFriendId, user, isTyping]);

  return { isFriendTyping, handleUserTyping };
};
