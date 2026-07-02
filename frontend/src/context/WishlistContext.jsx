import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchWishlist = async () => {
    if (!user) return setWishlistIds([]);
    try {
      const res = await api.get('/wishlist/ids');
      setWishlistIds(res.data);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) return false;
    const res = await api.post('/wishlist/toggle', { productId });
    setWishlistIds(res.data.wishlist.map((id) => id.toString()));
    return res.data.added;
  };

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);