'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import AuthInitializer from './components/AuthInitializer';
import GlobalSocketListener from './components/GlobalSocketListener';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6C63FF',
        },
        secondary: {
            main: '#FF6584',
        },
        background: {
            default: '#121212',
            paper: '#1E1E1E',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer />
            <GlobalSocketListener />
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </Provider>
    );
}
