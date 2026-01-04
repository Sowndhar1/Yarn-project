import { createContext, useContext, useEffect, useMemo, useState } from "react";

const storageKey = "yb_customer_accounts";
const sessionKey = "yb_customer_session";

const CustomerAuthContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const CustomerAuthProvider = ({ children }) => {
  const [customers, setCustomers] = useState(() => readStorage(storageKey, []));
  const [customer, setCustomer] = useState(() => readStorage(sessionKey, null));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (customer) {
      localStorage.setItem(sessionKey, JSON.stringify(customer));
    } else {
      localStorage.removeItem(sessionKey);
    }
  }, [customer]);

  const registerCustomer = (payload) => {
    const exists = customers.some((entry) => entry.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      throw new Error("Email already registered.");
    }
    const newCustomer = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
      ...payload,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const customerLogin = (email, password) => {
    const match = customers.find(
      (entry) =>
        entry.email.toLowerCase() === email.toLowerCase().trim() && entry.password === password.trim()
    );
    if (!match) {
      throw new Error("Invalid email or password.");
    }
    setCustomer(match);
    return match;
  };

  const customerLogout = () => {
    setCustomer(null);
  };

  const value = useMemo(
    () => ({
      customer,
      customers,
      registerCustomer,
      customerLogin,
      customerLogout,
    }),
    [customer, customers]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === null) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
};
