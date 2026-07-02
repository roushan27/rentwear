import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetails from './pages/ProductDetails';
import MyRentals from './pages/MyRentals';
import KycUpload from './pages/KycUpload';
import ProtectedRoute from './components/ProtectedRoute';
import Wallet from './pages/Wallet';
import ListItem from './pages/ListItem';
import MyListings from './pages/MyListings';
import ProductChat from './pages/ProductChat';
import Inbox from './pages/Inbox';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rentwear/:slug" element={<ProductDetails />} />
        <Route
          path="/my-rentals"
          element={
            <ProtectedRoute>
              <MyRentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kyc"
          element={
            <ProtectedRoute>
              <KycUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
  path="/list-item"
  element={
    <ProtectedRoute>
      <ListItem />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-listings"
  element={
    <ProtectedRoute>
      <MyListings />
    </ProtectedRoute>
  }
/>
<Route
  path="/chat/:productId"
  element={
    <ProtectedRoute>
      <ProductChat />
    </ProtectedRoute>
  }
/>
<Route
  path="/inbox"
  element={
    <ProtectedRoute>
      <Inbox />
    </ProtectedRoute>
  }
/>
<Route
  path="/wishlist"
  element={
    <ProtectedRoute>
      <Wishlist />
    </ProtectedRoute>
  }
/>
      </Routes>
    </>
  );
}

export default App;