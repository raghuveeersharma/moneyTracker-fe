'use client';

import { useGetDashboardStatsQuery } from '../../features/transactions/transactionsApi';
import DashboardCharts from '../../components/DashboardCharts';
import { Typography, Grid, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import MotionWrapper from '../../components/MotionWrapper';

export default function DashboardPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const { data, isLoading } = useGetDashboardStatsQuery();

    if (isLoading) return <Typography>Loading stats...</Typography>;
    if (!data) return <Typography>No data available</Typography>;

    return (
        <MotionWrapper>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="h4" fontWeight="bold">Hello, {user?.username} 👋</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Here is your financial summary.</Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <DashboardCharts data={data} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                        <List>
                            {data.recent.map((t, index) => (
                                <div key={t._id}>
                                    {index > 0 && <Divider component="li" />}
                                    <ListItem>
                                        <ListItemText
                                            primary={t.counterpartyName}
                                            secondary={new Date(t.date).toLocaleDateString()}
                                        />
                                        <Chip
                                            label={t.type.toUpperCase()}
                                            color={t.type === 'lend' ? 'success' : 'error'}
                                            size="small"
                                            sx={{ mr: 2 }}
                                        />
                                        <Typography fontWeight="bold" color={t.type === 'lend' ? 'success.main' : 'error.main'}>
                                            {t.type === 'lend' ? '+' : '-'}${t.amount}
                                        </Typography>
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </MotionWrapper>
    );
}
