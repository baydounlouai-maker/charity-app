import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Collapse,
  Container, Grid, TextField, Typography,
} from '@mui/material';
import Layout from '../../components/Layout';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () =>
    fetch('/api/profile/contacts').then((r) => r.json()).then(setContacts).catch(console.error);

  useEffect(() => { load(); }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/profile/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setForm({ label: '', name: '', email: '', phone: '' });
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
          <Typography variant="h4" fontWeight={700}>My Contacts</Typography>
          <Button variant="contained" onClick={() => { setShowForm((v) => !v); setError(''); }}>
            {showForm ? 'Cancel' : '+ Add Contact'}
          </Button>
        </Box>

        <Collapse in={showForm}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>New Contact</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Label (e.g. Director, Coordinator)" fullWidth required
                  margin="normal" value={form.label} onChange={set('label')}
                />
                <TextField
                  label="Full Name" fullWidth required
                  margin="normal" value={form.name} onChange={set('name')}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label="Email" type="email" fullWidth margin="normal" value={form.email} onChange={set('email')} />
                  <TextField label="Phone" fullWidth margin="normal" value={form.phone} onChange={set('phone')} />
                </Box>
                <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 1 }}>
                  {loading ? 'Saving…' : 'Save Contact'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {contacts.length === 0 ? (
          <Typography color="text.secondary">No contacts saved yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {contacts.map((c) => (
              <Grid item xs={12} sm={6} key={c.id}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography fontWeight={600} gutterBottom>{c.label}</Typography>
                    <Typography variant="body2">{c.name}</Typography>
                    {c.email && <Typography variant="body2" color="text.secondary">{c.email}</Typography>}
                    {c.phone && <Typography variant="body2" color="text.secondary">{c.phone}</Typography>}
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
