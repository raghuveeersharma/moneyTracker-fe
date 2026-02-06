'use client';

import { useState } from 'react';
import {
    useGetTransactionsQuery,
    useDeleteTransactionMutation,
    useRespondToTransactionMutation
} from '../../../features/transactions/transactionsApi';
import TransactionModal from '../../../components/TransactionModal';
import { Transaction } from '../../../types';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Typography, Box, Chip, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MotionWrapper from '../../../components/MotionWrapper';

export default function TransactionsPage() {
    const { data: transactions, isLoading } = useGetTransactionsQuery();
    const [deleteTransaction] = useDeleteTransactionMutation();
    const [respondToTransaction] = useRespondToTransactionMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const handleCreate = () => {
        setSelectedTransaction(null);
        setIsModalOpen(true);
    };

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
        }
    };

    const handleRespond = async (id: string, action: 'accept' | 'reject') => {
        await respondToTransaction({ id, action });
    };

    const getApprovalColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    return (
        <MotionWrapper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Transactions</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    New Transaction
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>With</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Approval</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : transactions?.map((t) => (
                            <TableRow key={t._id}>
                                <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {t.counterpartyName}
                                    {!t.isCreator && (
                                        <Chip label="Received" size="small" sx={{ ml: 1 }} color="info" variant="outlined" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        color={(t.displayType || t.type) === 'lend' ? 'success.main' : 'error.main'}
                                        fontWeight="bold"
                                    >
                                        {(t.displayType || t.type).toUpperCase()}
                                    </Typography>
                                </TableCell>
                                <TableCell>${t.amount}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={t.paymentStatus}
                                        color={t.paymentStatus === 'paid' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={t.approvalStatus}
                                        color={getApprovalColor(t.approvalStatus)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {/* If user is counterparty and status is pending, show accept/reject buttons */}
                                    {!t.isCreator && t.approvalStatus === 'pending' && (
                                        <>
                                            <Tooltip title="Accept">
                                                <IconButton
                                                    onClick={() => handleRespond(t._id, 'accept')}
                                                    color="success"
                                                    size="small"
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton
                                                    onClick={() => handleRespond(t._id, 'reject')}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                    {/* Only creator can edit/delete */}
                                    {t.isCreator && (
                                        <>
                                            <IconButton onClick={() => handleEdit(t)} color="primary" size="small">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(t._id)} color="error" size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && transactions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No transactions found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TransactionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transaction={selectedTransaction}
            />
        </MotionWrapper>
    );
}
