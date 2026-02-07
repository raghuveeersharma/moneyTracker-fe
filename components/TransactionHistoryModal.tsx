'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Chip,
    Divider
} from '@mui/material';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useGetFriendTransactionsQuery } from '../features/transactions/transactionsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface TransactionHistoryModalProps {
    open: boolean;
    onClose: () => void;
    friendId: string | null;
    friendName?: string;
}

export default function TransactionHistoryModal({ open, onClose, friendId, friendName }: TransactionHistoryModalProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const [page, setPage] = useState(1);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);

    // We will fetch ALL or large chunk for virtualization to be effective without complex infinite loader for now
    // Or we could implement iterative loading.
    // For "Pagination", let's load a large batch (e.g., 50 or 100) and provide a "Load More" at bottom?
    // User asked for "using pagination and virtualization".
    // Let's stick to simple "Load More" logic by incrementing limit or page.
    // Actually, to keep it simple with virtualized list, getting *all* is easiest if not huge.
    // Let's try page 1 with 100 limit.

    const limit = 1000; // Fetching a large number effectively simulates "all" for personal finance context typically
    const { data, isLoading, isFetching } = useGetFriendTransactionsQuery(
        { friendId: friendId || '', page: 1, limit },
        { skip: !friendId || !open }
    );

    const transactions = data?.transactions || [];
    const stats = data?.stats;

    // Row component for react-window
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const transaction = transactions[index];
        const isCreator = transaction.creatorId._id === user?._id;

        // Determine if this transaction was "I gave" or "I received"
        // Lend + Creator=Me => I gave
        // Borrow + Creator=Me => I received
        // Lend + Creator=Friend => I received
        // Borrow + Creator=Friend => I gave (Friend borrowed from me)

        let typeLabel = '';
        let color = '';
        let amountPrefix = '';

        if (isCreator) {
            if (transaction.type === 'lend') {
                typeLabel = 'You lent';
                color = 'error.main'; // Money left me
                amountPrefix = '-';
            } else {
                typeLabel = 'You borrowed';
                color = 'success.main'; // Money came to me
                amountPrefix = '+';
            }
        } else {
            if (transaction.type === 'lend') {
                typeLabel = `${transaction.creatorId.username} lent you`;
                color = 'success.main'; // Money came to me
                amountPrefix = '+';
            } else {
                typeLabel = `${transaction.creatorId.username} borrowed`;
                color = 'error.main'; // Money left me
                amountPrefix = '-';
            }
        }

        const isPaid = transaction.paymentStatus === 'paid';

        return (
            <div style={style}>
                <Paper
                    sx={{
                        mx: 1,
                        my: 0.5,
                        p: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'background.paper'
                    }}
                    elevation={1}
                >
                    <Box>
                        <Typography variant="body1" fontWeight="medium">
                            {typeLabel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString()}
                        </Typography>
                        {isPaid && <Chip label="PAID" size="small" color="success" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} />}
                        {transaction.approvalStatus === 'pending' && <Chip label="PENDING" size="small" color="warning" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} />}
                    </Box>
                    <Typography variant="h6" color={color} fontWeight="bold">
                        {amountPrefix}${transaction.amount}
                    </Typography>
                </Paper>
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { height: '80vh' } }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">History with {friendName}</Typography>
                    {isLoading && <CircularProgress size={20} />}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
                {/* Summary Section */}
                {stats && (
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
                            NET BALANCE
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                            {stats.netBalance > 0 ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="success.main" fontWeight="bold">
                                        +${stats.netBalance.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="success.main">
                                        {friendName} owes you
                                    </Typography>
                                </Box>
                            ) : stats.netBalance < 0 ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="error.main" fontWeight="bold">
                                        -${Math.abs(stats.netBalance).toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2" color="error.main">
                                        You owe {friendName}
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="text.primary" fontWeight="bold">
                                        $0.00
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        All settled up
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Optional Breakdown */}
                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Total Given</Typography>
                                <Typography variant="body1" color="error.main">${stats.totalGiven}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Total Received</Typography>
                                <Typography variant="body1" color="success.main">${stats.totalReceived}</Typography>
                            </Box>
                        </Box> */}
                    </Box>
                )}

                {/* List Section */}
                <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                    {!data ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : transactions.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No transactions found.</Typography>
                        </Box>
                    ) : (
                        <AutoSizer
                            renderProp={({ height, width }) => (
                                <List<{}>
                                    style={{ height: height ?? 0, width: width ?? 0 }}
                                    rowProps={{}}
                                    rowCount={transactions.length}
                                    rowHeight={80}
                                    rowComponent={Row}
                                />
                            )}
                        />
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog >
    );
}
