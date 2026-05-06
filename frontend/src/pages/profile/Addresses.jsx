import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Collapse,
  Container, Grid, TextField, Typography,
} from '@mui/material';
import Layout from '../../components/Layout';

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', street: '', city: '', state: '', zip: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch('/api/profile/addresses').then((r) => r.json()).then(setAddresses).catch(console.error);

  useEffect(() => { load(); }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/profile/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setForm({ label: '', street: '', city: '', state: '', zip: '', country: '' });
      setShowForm(false);
      load();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>My Addresses</Typography>
          <Button variant="contained" onClick={() => { setShowForm((v) => !v); setError(''); }}>
            {showForm ? 'Cancel' : '+ Add Address'}
          </Button>
        </Box>

        <Collapse in={showForm}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>New Address</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Label (e.g. HQ, Warehouse)" fullWidth required
                  margin="normal" value={form.label} onChange={set('label')}
                />
                <TextField
                  label="Street" fullWidth required
                  margin="normal" value={form.street} onChange={set('street')}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="City" fullWidth required margin="normal" value={form.city} onChange={set('city')} />
                  <TextField label="State / Region" fullWidth margin="normal" value={form.state} onChange={set('state')} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="ZIP / Postal Code" fullWidth margin="normal" value={form.zip} onChange={set('zip')} />
                  <TextField label="Country" fullWidth required margin="normal" value={form.country} onChange={set('country')} />
                </Box>
                <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 1 }}>
                  {loading ? 'Saving…' : 'Save Address'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {addresses.length === 0 ? (
          <Typography color="text.secondary">No addresses saved yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {addresses.map((a) => (
              <Grid item xs={12} sm={6} key={a.id}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography fontWeight={600} gutterBottom>{a.label}</Typography>
                    <Typography variant="body2">{a.street}</Typography>
                    <Typography variant="body2">
                      {a.city}{a.state ? `, ${a.state}` : ''}{a.zip ? ` ${a.zip}` : ''}
                    </Typography>
                    <Typography variant="body2">{a.country}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}
