import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ManageProducts from './pages/ManageProducts';
import ManageKyc from './pages/ManageKyc';
import ManageOrders from './pages/ManageOrders';
import ManageListings from './pages/ManageListings';

function AdminLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><ManageProducts /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/kyc"
        element={
        <ProtectedAdminRoute>
         <AdminLayout><ManageKyc /></AdminLayout>
         </ProtectedAdminRoute>
         }
       />
      <Route
        path="/orders"
        element={
          <ProtectedAdminRoute>
            <AdminLayout><ManageOrders /></AdminLayout>
          </ProtectedAdminRoute>
        }
      />
      <Route
  path="/listings"
  element={
    <ProtectedAdminRoute>
      <AdminLayout><ManageListings /></AdminLayout>
    </ProtectedAdminRoute>
  }
/>
    </Routes>
    
  );
}

export default App;