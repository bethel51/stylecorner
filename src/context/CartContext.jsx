import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultCartContext = {
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  itemCount: 0,
};

const CartContext = createContext(defaultCartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('style_corner_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('style_corner_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (product, quantityToAdd = 1) => {
    if (!product) return;
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

  const subtotal = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1), 0)
    : 0;
  const itemCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
    : 0;

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

export const useCart = () => {
  const context = useContext(CartContext);
  return context || defaultCartContext;
};

