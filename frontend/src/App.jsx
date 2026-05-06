import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RequestList from './pages/charity/RequestList';
import RequestCreate from './pages/charity/RequestCreate';
import Addresses from './pages/profile/Addresses';
import Contacts from './pages/profile/Contacts';

function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();
  console.log({ user, authReady });
  if (!authReady) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  return !user ? children : <Navigate to="/" replace />;
}

function CharityRoute({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (!user?.roles) return <Navigate to="/login" replace />;
  if (!user.roles.includes('Charity')) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"        element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"     element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/"             element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/requests"          element={<CharityRoute><RequestList /></CharityRoute>} />
          <Route path="/requests/new"      element={<CharityRoute><RequestCreate /></CharityRoute>} />
          <Route path="/profile/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          <Route path="/profile/contacts"  element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
