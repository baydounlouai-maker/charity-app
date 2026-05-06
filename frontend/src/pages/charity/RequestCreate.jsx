import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Container, FormControl,
  InputLabel, MenuItem, Paper, Select, TextField, Typography,
} from '@mui/material';
import Layout from '../../components/Layout';

const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function RequestCreate() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [addressId, setAddressId] = useState('');
  const [contactId, setContactId] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/profile/addresses').then((r) => r.json()),
      fetch('/api/profile/contacts').then((r) => r.json()),
    ]).then(([cats, addrs, conts]) => {
      setCategories(cats);
      setAddresses(addrs);
      setContacts(conts);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          description,
          due_date:    dueDate,
          address_id:  addressId,
          contact_id:  contactId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      navigate('/requests');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          New Request
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>

          {/* ── Request details ── */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Request Details</Typography>

            <FormControl fullWidth required margin="normal">
              <InputLabel>Category</InputLabel>
              <Select value={categoryId} label="Category" onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description" fullWidth required multiline rows={4}
              margin="normal" value={description} onChange={(e) => setDescription(e.target.value)}
            />

            <TextField
              label="Due Date" type="date" fullWidth required
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: minDate() }}
              value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            />
          </Paper>

          {/* ── Address ── */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="h6">Address</Typography>
              <Typography variant="body2">
                <Link to="/profile/addresses">Manage addresses</Link>
              </Typography>
            </Box>

            {addresses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No addresses saved.{' '}
                <Link to="/profile/addresses">Add one first.</Link>
              </Typography>
            ) : (
              <FormControl fullWidth required margin="normal">
                <InputLabel>Select address</InputLabel>
                <Select value={addressId} label="Select address" onChange={(e) => setAddressId(e.target.value)}>
                  {addresses.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.label} — {a.street}, {a.city}, {a.country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Paper>

          {/* ── Contact info ── */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="h6">Contact Info</Typography>
              <Typography variant="body2">
                <Link to="/profile/contacts">Manage contacts</Link>
              </Typography>
            </Box>

            {contacts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No contacts saved.{' '}
                <Link to="/profile/contacts">Add one first.</Link>
              </Typography>
            ) : (
              <FormControl fullWidth required margin="normal">
                <InputLabel>Select contact</InputLabel>
                <Select value={contactId} label="Select contact" onChange={(e) => setContactId(e.target.value)}>
                  {contacts.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.label} — {c.name}{c.email ? ` (${c.email})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Paper>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" size="large" onClick={() => navigate('/requests')}>
              Cancel
            </Button>
            <Button
              type="submit" variant="contained" size="large" disabled={loading}
            >
              {loading ? 'Submitting…' : 'Create Request'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
}
