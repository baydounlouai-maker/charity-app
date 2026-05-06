import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6" fontWeight={700}
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Char App
          </Typography>
          {user?.roles?.includes('Charity') && (
            <>
              <Button color="inherit" onClick={() => navigate('/requests')}>My Requests</Button>
              <Button color="inherit" onClick={() => navigate('/profile/addresses')}>Addresses</Button>
              <Button color="inherit" onClick={() => navigate('/profile/contacts')}>Contacts</Button>
            </>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box>{children}</Box>
    </>
  );
}
