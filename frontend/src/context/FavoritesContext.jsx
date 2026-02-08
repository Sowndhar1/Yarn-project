import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../lib/api';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('yarn-favorites');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Sync with backend when user logs in
    useEffect(() => {
        const syncWishlist = async () => {
            if (user && token) {
                try {
                    const { wishlist } = await fetchWishlist(token);
                    // Ensure backend items have consistent ID format for frontend use
                    // If backend sends populated objects, use them.
                    setFavorites(wishlist || []);
                } catch (error) {
                    console.error("Failed to sync wishlist:", error);
                }
            }
        };

        syncWishlist();
    }, [user, token]);

    // Persist favorites to localStorage (always, as a backup/cache or for guest)
    useEffect(() => {
        if (!user) {
            localStorage.setItem('yarn-favorites', JSON.stringify(favorites));
        }
    }, [favorites, user]);

    const addToFavorites = async (product) => {
        const productId = product.id || product._id;

        // Optimistic update
        setFavorites((prev) => {
            if (prev.some((item) => (item.id || item._id) === productId)) {
                return prev;
            }
            return [...prev, product];
        });

        if (user && token) {
            try {
                await apiAddToWishlist(token, productId);
            } catch (error) {
                console.error("Failed to add to wishlist backend:", error);
                // Rollback on error? For now, we keep optimistic UI but maybe notify user
            }
        }
    };

    const removeFromFavorites = async (productId) => {
        // Optimistic update
        setFavorites((prev) => prev.filter((item) => (item.id || item._id) !== productId));

        if (user && token) {
            try {
                await apiRemoveFromWishlist(token, productId);
            } catch (error) {
                console.error("Failed to remove from wishlist backend:", error);
            }
        }
    };

    const toggleFavorite = (product) => {
        const productId = product.id || product._id;
        if (isFavorite(productId)) {
            removeFromFavorites(productId);
        } else {
            addToFavorites(product);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some((item) => (item.id || item._id) === productId);
    };

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};
