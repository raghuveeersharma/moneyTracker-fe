'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { DashboardStats } from '../types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface Props {
    data: DashboardStats;
}

export default function DashboardCharts({ data }: Props) {
    const lendStat = data.stats.find(s => s._id === 'lend') || { totalAmount: 0, count: 0 };
    const borrowStat = data.stats.find(s => s._id === 'borrow') || { totalAmount: 0, count: 0 };

    const barData = {
        labels: ['Lent', 'Borrowed'],
        datasets: [
            {
                label: 'Total Amount',
                data: [lendStat.totalAmount, borrowStat.totalAmount],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            },
        ],
    };

    const doughnutData = {
        labels: ['Lent Count', 'Borrowed Count'],
        datasets: [
            {
                data: [lendStat.count, borrowStat.count],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            }
        ]
    };

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom>Financial Overview</Typography>
                    <Box sx={{ width: '100%', height: 300 }}>
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom>Transaction Volume</Typography>
                    <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
}
