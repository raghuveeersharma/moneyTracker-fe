'use client';

import { useState } from 'react';
import { useGetContactsQuery, useAddContactMutation, useDeleteContactMutation } from '../../../features/contacts/contactsApi';
import {
    Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, Button, Typography, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MotionWrapper from '../../../components/MotionWrapper';

export default function ContactsPage() {
    const { data: contacts, isLoading } = useGetContactsQuery();
    const [addContact] = useAddContactMutation();
    const [deleteContact] = useDeleteContactMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [newContactPhone, setNewContactPhone] = useState('');

    const handleAdd = async () => {
        if (newContactName) {
            await addContact({ name: newContactName, phone: newContactPhone });
            setIsModalOpen(false);
            setNewContactName('');
            setNewContactPhone('');
        }
    };

    return (
        <MotionWrapper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Contacts</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
                    New Contact
                </Button>
            </Box>

            <Paper>
                <List>
                    {isLoading ? <Typography sx={{ p: 2 }}>Loading...</Typography> : contacts?.map((contact) => (
                        <ListItem key={contact._id} divider>
                            <ListItemText
                                primary={contact.name}
                                secondary={contact.phone || 'No phone'}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => deleteContact(contact._id)}>
                                    <DeleteIcon color="error" />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {!isLoading && contacts?.length === 0 && <Typography sx={{ p: 2 }}>No contacts yet.</Typography>}
                </List>
            </Paper>

            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <DialogTitle>Add Contact</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                    <TextField
                        label="Name"
                        fullWidth
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                    />
                    <TextField
                        label="Phone"
                        fullWidth
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </MotionWrapper>
    );
}
