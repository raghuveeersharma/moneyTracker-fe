import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(globalSocket);

  useEffect(() => {
    // Only connect if we have a token and user
    if (token && user) {
      // If no socket exists, or if we had one but disconnected
      if (!globalSocket || !globalSocket.connected) {
        // Use relative path - proxy will handle forwarding to port 4000
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        globalSocket = io(socketUrl, {
          path: '/socket.io',
          auth: { token },
          transports: ['websocket', 'polling'], // Try websocket first
          reconnection: true,
          reconnectionAttempts: 5,
        });

        globalSocket.on('connect', () => {
          console.log('Socket connected:', globalSocket?.id);
        });

        globalSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        globalSocket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });
      }
      
      // Always ensure state is in sync with global
      setSocket(globalSocket);

      // Join room logic - handled here to cover both initial connect and re-renders
      if (globalSocket && globalSocket.connected) {
          console.log('Joining room:', user._id);
          globalSocket.emit('join_room', user._id);
      } else if (globalSocket) {
        // If not connected yet, listen for connect event to join
        // We use .once to avoid multiple listeners if deps change
        const onConnect = () => {
             console.log('Socket connected (delayed), joining room:', user._id);
             globalSocket?.emit('join_room', user._id);
        };
        globalSocket.on('connect', onConnect);
        
        // Cleanup listener if component unmounts or deps change before connect
        return () => {
            globalSocket?.off('connect', onConnect);
        };
      }
    }
    
    return () => {
       // Cleanup logic if needed
    };
  }, [token, user]);
    


  return socket;
};

export const getSocket = () => globalSocket;
