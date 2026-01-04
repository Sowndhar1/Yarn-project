import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { fetchProductDetail } from '../lib/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();

    // Determine the storage key based on current user
    // B2B Policy: Guests are not authorized to have a persistent cart.
    const getCartKey = () => user ? `yarn-cart-${user.id}` : 'yarn-cart-unauthorized';

    const [cartItems, setCartItems] = useState([]);

    // Load cart items whenever the user (and thus the key) changes
    useEffect(() => {
        if (!user) {
            setCartItems([]);
            return;
        }

        try {
            const key = getCartKey();
            const saved = localStorage.getItem(key);
            setCartItems(saved ? JSON.parse(saved) : []);
        } catch {
            setCartItems([]);
        }
    }, [user?.id]);

    // Cleanup any legacy guest cart data to enforce protocol
    useEffect(() => {
        localStorage.removeItem('yarn-cart-guest');
        if (!user) {
            setCartItems([]);
        }
    }, [user]);

    // Persist cart ONLY for authenticated users
    useEffect(() => {
        if (user && (cartItems.length > 0 || localStorage.getItem(getCartKey()))) {
            localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
        }
    }, [cartItems, user?.id]);

    const addToCart = (product, quantity = 1) => {
        if (!user) {
            console.warn("Unauthorized attempt to add to cart blocked.");
            return;
        }

        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);

            if (existing) {
                // Update quantity if item already in cart
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Add new item to cart
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prev) =>
            prev.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getItemQuantity = (productId) => {
        const item = cartItems.find((item) => item.id === productId);
        return item ? item.quantity : 0;
    };

    const refreshCartItems = async () => {
        if (cartItems.length === 0) return;

        try {
            // In a real app, we'd have a bulk fetch endpoint.
            // For now, we'll fetch them individually.
            const updatedItems = await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const freshData = await fetchProductDetail(item.id);
                        if (freshData.success) {
                            return {
                                ...item,
                                pricePerKg: freshData.data.pricePerKg,
                                stockLevel: freshData.data.stockLevel || 0,
                                // keep other cart-specific props like quantity
                            };
                        }
                    } catch (e) {
                        console.error("Failed to refresh product", item.id);
                    }
                    return item;
                })
            );

            setCartItems(updatedItems);
        } catch (error) {
            console.error("Error refreshing cart:", error);
        }
    };

    // Calculate cart totals
    const cartTotals = useMemo(() => {
        const subtotal = cartItems.reduce(
            (sum, item) => sum + item.pricePerKg * item.quantity,
            0
        );

        const gst = cartItems.reduce(
            (sum, item) => sum + (item.pricePerKg * item.quantity * (item.gstRate || 18)) / 100,
            0
        );

        const shipping = subtotal > 5000 ? 0 : 200; // Free shipping above ₹5000
        const total = subtotal + gst + shipping;

        return {
            subtotal,
            gst,
            shipping,
            total,
            itemCount: cartItems.length,
        };
    }, [cartItems]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        cartTotals,
        refreshCartItems
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
