'use client';

import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, FormControl, InputLabel, Select,
    Autocomplete, Avatar, Box, Typography
} from '@mui/material';
import { Transaction } from '../types';
import { useAddTransactionMutation, useUpdateTransactionMutation } from '../features/transactions/transactionsApi';
import { useGetFriendsQuery, Friend } from '../features/friends/friendApi';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
    open: boolean;
    onClose: () => void;
    transaction?: Transaction | null;
}

const schema = z.object({
    type: z.enum(['lend', 'borrow']),
    amount: z.number().positive(),
    counterpartyName: z.string().min(1, 'Friend is required'),
    counterpartyId: z.string().min(1, 'Friend is required'),
    paymentStatus: z.enum(['pending', 'paid']),
    date: z.string(),
    notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function TransactionModal({ open, onClose, transaction }: Props) {
    const [addTransaction] = useAddTransactionMutation();
    const [updateTransaction] = useUpdateTransactionMutation();
    const { data: friends, isLoading: loadingFriends } = useGetFriendsQuery();

    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

    const { control, handleSubmit, reset, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: 'lend',
            amount: 0,
            counterpartyName: '',
            counterpartyId: '',
            paymentStatus: 'pending',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        },
    });

    useEffect(() => {
        if (transaction) {
            reset({
                type: transaction.type,
                amount: transaction.amount,
                counterpartyName: transaction.counterpartyName,
                counterpartyId: typeof transaction.counterpartyId === 'string'
                    ? transaction.counterpartyId
                    : transaction.counterpartyId._id,
                paymentStatus: transaction.paymentStatus,
                date: new Date(transaction.date).toISOString().split('T')[0],
                notes: transaction.notes,
            });
            // Try to find the friend
            // Try to find the friend
            const cpId = typeof transaction.counterpartyId === 'string'
                ? transaction.counterpartyId
                : transaction.counterpartyId._id;
            const friend = friends?.find(f => f._id === cpId);
            if (selectedFriend?._id !== friend?._id) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedFriend(friend || null);
            }
        } else {
            reset({
                type: 'lend',
                amount: 0,
                counterpartyName: '',
                counterpartyId: '',
                paymentStatus: 'pending',
                date: new Date().toISOString().split('T')[0],
                notes: '',
            });
            if (selectedFriend !== null) {
                setSelectedFriend(null);
            }
        }
    }, [transaction, reset, open, friends, selectedFriend]); // Added selectedFriend to deps

    const handleFriendChange = (friend: Friend | null) => {
        setSelectedFriend(friend);
        if (friend) {
            setValue('counterpartyName', friend.username);
            setValue('counterpartyId', friend._id);
        } else {
            setValue('counterpartyName', '');
            setValue('counterpartyId', '');
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            if (transaction) {
                await updateTransaction({ id: transaction._id, body: data }).unwrap();
            } else {
                await addTransaction(data).unwrap();
            }
            onClose();
        } catch (error) {
            console.error('Failed to save transaction', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{transaction ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select {...field} label="Type">
                                    <MenuItem value="lend">Lend (You give money)</MenuItem>
                                    <MenuItem value="borrow">Borrow (You receive money)</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />

                    <Controller
                        name="amount"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextField
                                {...field}
                                label="Amount"
                                type="number"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                        )}
                    />

                    {/* Friend Select with Autocomplete */}
                    <Autocomplete
                        options={friends || []}
                        loading={loadingFriends}
                        value={selectedFriend}
                        onChange={(_, newValue) => handleFriendChange(newValue)}
                        getOptionLabel={(option) => option.username}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        disabled={!!transaction} // Can't change friend when editing
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
                            <Controller
                                name="counterpartyName"
                                control={control}
                                render={({ fieldState }) => (
                                    <TextField
                                        {...params}
                                        label="Select Friend"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message || 'Transaction will be sent to this friend for approval'}
                                    />
                                )}
                            />
                        )}
                    />

                    <Controller
                        name="paymentStatus"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel>Payment Status</InputLabel>
                                <Select {...field} label="Payment Status">
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />

                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />

                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Notes"
                                fullWidth
                                multiline
                                rows={2}
                            />
                        )}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">Save</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
