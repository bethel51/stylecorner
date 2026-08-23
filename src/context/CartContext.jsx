import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('style_corner_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('style_corner_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantityToAdd = 1) => {
    setCart((prev) => {
      const qty = Number(quantityToAdd) || 1;
      const existing = prev.find((item) => item.id === product.id || item.title === product.title);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id || item.title === product.title
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId && item.title !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId || item.title === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
