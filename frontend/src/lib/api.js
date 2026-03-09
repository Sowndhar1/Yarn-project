export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
};

const buildHeaders = (token, headers = {}) => {
  const finalHeaders = { ...headers };
  if (token) {
    console.log('API Request: Authorization token present');
    finalHeaders.Authorization = `Bearer ${token}`;
  } else {
    console.warn('API Request: NO AUTHORIZATION TOKEN PROVIDED');
  }
  return finalHeaders;
};

const apiRequest = async (
  endpoint,
  { method = "GET", token, body, headers = {} } = {}
) => {
  const requestHeaders = buildHeaders(token, headers);
  let finalBody = body;

  if (body && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
    // Stringify if it's an object and not already a string
    finalBody = typeof body === "string" ? body : JSON.stringify(body);
  }

  console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: finalBody,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`API Error ${response.status}:`, errText);

    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorData = JSON.parse(errText);
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Not JSON, use text if available
      errorMsg = errText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
};

export const fetchProducts = async (params = {}) => {
  const qs = new URLSearchParams(params);
  const query = qs.toString() ? `?${qs}` : "";
  return apiRequest(`/products${query}`);
};

export const createOrder = async (payload, token) => {
  // Use specialized checkout endpoint which handles payments and emails
  return apiRequest("/checkout/place-order", { method: "POST", body: payload, token });
};

export const verifyPayment = async (payload, token) => {
  return apiRequest("/checkout/verify-payment", { method: "POST", body: payload, token });
};

export const loginRequest = (identifier, password, userType = 'staff') =>
  apiRequest("/auth/login", {
    method: "POST",
    body: {
      identifier,
      password,
      user_type: userType // Changed from userType to user_type to match backend expectation
    },
  });

export const registerRequest = (payload) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: payload,
  });

export const fetchProfile = (token) =>
  apiRequest("/auth/me", {
    token,
  });

export const changePasswordRequest = (token, currentPassword, newPassword) =>
  apiRequest("/auth/password", {
    method: "POST",
    token,
    body: { currentPassword, newPassword },
  });

export const updateProfileRequest = (token, payload) =>
  apiRequest("/auth/profile", {
    method: "PUT",
    token,
    body: payload,
  });

export const fetchOrders = (token) =>
  apiRequest("/orders", {
    token,
  });

export const fetchMyOrders = (token) =>
  apiRequest("/orders/my-orders", { token });

export const fetchOrder = (orderId, token) =>
  apiRequest(`/orders/${orderId}`, { token });

export const updateOrderStatus = (orderId, status, token) =>
  apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });

export const fetchStockSummary = (token) =>
  apiRequest("/stock/summary", { token });

export const fetchStockAlerts = (token) =>
  apiRequest("/stock/alerts", { token });

export const fetchStockMovements = (token, limit = 10) =>
  apiRequest(`/stock/movements?limit=${limit}`, { token });

export const fetchStockRecords = (token) =>
  apiRequest("/stock", { token });

export const updateStockQuantity = (productId, payload, token) =>
  apiRequest(`/stock/${productId}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const fetchSalesSummary = (token) =>
  apiRequest("/sales/summary", { token });

export const fetchPurchaseSummary = (token) =>
  apiRequest("/purchases/summary", { token });

export const createPurchase = (payload, token) =>
  apiRequest("/purchases", {
    method: "POST",
    token,
    body: payload,
  });

export const createSale = (payload, token) =>
  apiRequest("/sales", {
    method: "POST",
    token,
    body: payload,
  });

export const fetchSales = (token, params = {}) => {
  const qs = new URLSearchParams(params);
  const query = qs.toString() ? `?${qs}` : "";
  return apiRequest(`/sales${query}`, { token });
};

export const fetchPurchases = (token, params = {}) => {
  const qs = new URLSearchParams(params);
  const query = qs.toString() ? `?${qs}` : "";
  return apiRequest(`/purchases${query}`, { token });
};

export const fetchAdminDashboardStats = (token) =>
  apiRequest("/dashboard/admin/stats", { token });

export const createProduct = (token, productData) => {
  // Determine if we're sending FormData (for image upload) or JSON
  const isFormData = productData instanceof FormData;

  return apiRequest('/products', {
    method: 'POST',
    token,
    body: productData,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }
  });
};

export const updateProduct = (token, productId, productData) => {
  const isFormData = productData instanceof FormData;

  return apiRequest(`/products/${productId}`, {
    method: 'PUT',
    token,
    body: productData,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }
  });
};

export const fetchProductDetail = (productId) => {
  return apiRequest(`/products/${productId}`);
};

// Wishlist API
export const fetchWishlist = (token) =>
  apiRequest("/wishlist", { token });

export const addToWishlist = (token, productId) =>
  apiRequest("/wishlist/add", {
    method: "POST",
    token,
    body: { productId },
  });

export const removeFromWishlist = (token, productId) =>
  apiRequest(`/wishlist/${productId}`, {
    method: "DELETE",
    token,
  });
export const checkIdentifierRequest = (identifier) => {
  return apiRequest('/auth/check-identifier', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  });
};
export const getOrderDetailsRequest = (orderNumber, token) => {
  return apiRequest(`/checkout/order/${orderNumber}`, {
    method: 'GET',
    token
  });
};

// OTP Verification API
export const requestOTP = (payload) =>
  apiRequest("/auth/request-otp", {
    method: "POST",
    body: payload,
  });

export const verifyOTP = (payload) =>
  apiRequest("/auth/verify-otp", {
    method: "POST",
    body: payload,
  });
