import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Settings from './pages/Settings';
import Admin from './pages/admin/Admin';
import ShoppingList from './pages/ShoppingList';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const hasToken = localStorage.getItem('token');
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function UserRoute({ children }) {
  const { user, isAdmin } = useAuth();
  const hasToken = localStorage.getItem('token');
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  const hasToken = localStorage.getItem('token');
  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/dashboard"
          element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          }
        />
        <Route
          path="/income"
          element={
            <UserRoute>
              <Income />
            </UserRoute>
          }
        />
        <Route
          path="/expense"
          element={
            <UserRoute>
              <Expense />
            </UserRoute>
          }
        />
        <Route
          path="/shopping-list"
          element={
            <UserRoute>
              <ShoppingList />
            </UserRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </ConfirmProvider>
    </ToastProvider>
  );
}

