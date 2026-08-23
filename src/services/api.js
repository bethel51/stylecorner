const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your internet connection.');
    }
    throw err;
  }
};

// Safe JSON parser — returns null for empty/non-JSON responses
const safeJson = async (res) => {
  const text = await res.text();
  if (!text || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Server returned HTML or non-JSON (e.g., a static file or proxy error)
    console.error('Non-JSON response from server:', text.substring(0, 200));
    return null;
  }
};

export const api = {
  // Authentication
  register: async (userData) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Registration failed');
    return data;
  },

  verifyOtp: async (email, code) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Verification failed');
    return data;
  },

  resendOtp: async (email) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Resend verification failed');
    return data;
  },

  forgotPassword: async (email) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to send reset code');
    return data;
  },

  verifyResetOtp: async (email, otpCode) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Invalid verification code');
    return data;
  },

  resetPassword: async (email, otpCode, newPassword) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to reset password');
    return data;
  },

  login: async (credentials) => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await safeJson(res);
    if (!data) {
      throw new Error('Server returned an empty response. Please make sure the backend server is running on port 5000.');
    }
    if (!res.ok) {
      if (data.error === 'unverified') {
        const errorObj = new Error(data.message || 'Please verify your email.');
        errorObj.isUnverified = true;
        errorObj.email = data.email;
        throw errorObj;
      }
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  getMe: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch user');
    return data;
  },

  updateProfile: async (profileData) => {
    const res = await fetchWithTimeout(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to update profile');
    return data;
  },

  deleteAccount: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/users/account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to delete account');
    return data;
  },

  // Specialists & AI Matcher
  getSpecialists: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/specialists`);
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch specialists');
    return data;
  },

  matchAiSpecialist: async (requestText, primaryService, secondaryService) => {
    const res = await fetchWithTimeout(`${API_BASE}/ai/match-specialist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestText, primaryService, secondaryService }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'AI Matcher failed');
    return data;
  },

  // Bookings
  getBookings: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch bookings');
    return data;
  },

  createBooking: async (bookingData) => {
    const res = await fetchWithTimeout(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to save booking');
    return data;
  },

  updateBookingStatus: async (id, updateData) => {
    const payload = typeof updateData === 'string' ? { status: updateData } : updateData;
    const res = await fetchWithTimeout(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to update booking');
    return data;
  },

  deleteBooking: async (id) => {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to delete booking');
    return data;
  },

  clearBookingHistory: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/bookings/clear-history`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to clear booking history');
    return data;
  },

  // Orders
  getOrders: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/orders`, {
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch orders');
    return data;
  },

  createOrder: async (orderData) => {
    const res = await fetchWithTimeout(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to place order');
    return data;
  },

  updateOrderStatus: async (id, updateData) => {
    const payload = typeof updateData === 'string' ? { status: updateData } : updateData;
    const res = await fetchWithTimeout(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to update order');
    return data;
  },

  updateOrderTracking: async (id, trackingData) => {
    const res = await fetchWithTimeout(`${API_BASE}/orders/${id}/tracking`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(trackingData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to update order tracking');
    return data;
  },

  addOrderMessage: async (id, text) => {
    const res = await fetchWithTimeout(`${API_BASE}/orders/${id}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to send message');
    return data;
  },


  // Admin User Management
  getAdminUsers: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch user accounts');
    return data;
  },

  deleteAdminUser: async (userId) => {
    const res = await fetchWithTimeout(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to delete user account');
    return data;
  },

  // Products
  getProducts: async () => {
    const res = await fetchWithTimeout(`${API_BASE}/products`);
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch products');
    return data;
  },

  createProduct: async (productData) => {
    const res = await fetchWithTimeout(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to create product');
    return data;
  },

  updateProduct: async (id, productData) => {
    const res = await fetchWithTimeout(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to update product');
    return data;
  },

  deleteProduct: async (id) => {
    const res = await fetchWithTimeout(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.error || 'Failed to delete product');
    return data;
  },
};
