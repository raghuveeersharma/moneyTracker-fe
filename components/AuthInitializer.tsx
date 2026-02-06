'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, initializeAuth } from '../features/auth/authSlice';

export default function AuthInitializer() {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const userStr = sessionStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                dispatch(setCredentials({ user, token }));
            } catch {
                dispatch(initializeAuth());
            }
        } else {
            dispatch(initializeAuth());
        }
    }, [dispatch]);

    return null;
}
