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
      let socketInstance = globalSocket;

      // If no socket exists, or if we had one but disconnected
      if (!socketInstance || !socketInstance.connected) {
        // Use relative path - proxy will handle forwarding to port 4000
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        socketInstance = io(socketUrl, {
          path: '/socket.io',
          auth: { token },
          transports: ['websocket', 'polling'], // Try websocket first
          reconnection: true,
          reconnectionAttempts: 5,
        });
        
        // Update global reference
        globalSocket = socketInstance;

        socketInstance.on('connect', () => {
          console.log('Socket connected:', socketInstance?.id);
        });

        socketInstance.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });
      }
      
      // Update local state if different
      if (socket !== socketInstance) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);
      }

      // Join room logic - handled here to cover both initial connect and re-renders
      if (socketInstance && socketInstance.connected) {
          console.log('Joining room:', user._id);
          socketInstance.emit('join_room', user._id);
      } else if (socketInstance) {
        // If not connected yet, listen for connect event to join
        // We use .once to avoid multiple listeners if deps change
        const onConnect = () => {
             console.log('Socket connected (delayed), joining room:', user._id);
             socketInstance?.emit('join_room', user._id);
        };
        socketInstance.on('connect', onConnect);
        
        // Cleanup listener if component unmounts or deps change before connect
        return () => {
            socketInstance?.off('connect', onConnect);
        };
      }
    }
  }, [token, user]); // Removed socket from deps to avoid loop
    


  return socket;
};

export const getSocket = () => globalSocket;
