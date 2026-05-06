import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, Container, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import Layout from '../../components/Layout';

const STATUS_COLOR = {
  Pending:   'warning',
  Approved:  'success',
  Rejected:  'error',
  Finalized: 'info',
};

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/requests')
      .then((res) => res.json())
      .then(setRequests)
      .catch(console.error);
  }, []);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>My Requests</Typography>
          <Button variant="contained" onClick={() => navigate('/requests/new')}>
            + New Request
          </Button>
        </Box>

        {requests.length === 0 ? (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No requests yet. Create your first one.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Category</b></TableCell>
                  <TableCell><b>Description</b></TableCell>
                  <TableCell><b>Due Date</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Contact</b></TableCell>
                  <TableCell><b>Location</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.category}</TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" noWrap>{r.description}</Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(r.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        size="small"
                        color={STATUS_COLOR[r.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{r.contact?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.contact?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{r.address?.city}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.address?.country}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
}
