import {
  Avatar, Box, Card, CardContent, Chip,
  Container, Divider, Grid, Paper, Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 5 }}>
        {user && (
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
                {user.username[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{user.username}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                  <Chip label={`ID: ${user.id}`} size="small" />
                  {(user.roles ?? []).map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      size="small"
                      color={r === 'Admin' ? 'error' : r === 'Charity' ? 'success' : 'primary'}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back{user ? `, ${user.username}` : ''}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You&apos;re successfully authenticated. This is your homepage.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          {['Profile', 'Settings', 'Activity'].map((label) => (
            <Grid item xs={12} sm={4} key={label}>
              <Paper elevation={1} sx={{ p: 3, textAlign: 'center', cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' } }}>
                <Typography variant="h6" fontWeight={600}>{label}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Manage your {label.toLowerCase()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}
