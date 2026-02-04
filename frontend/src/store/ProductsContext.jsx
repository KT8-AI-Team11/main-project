import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_BASE_URL}/api` });

// ✅ ProductsPage처럼 토큰 자동 첨부 (중요!)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cosy_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      setLoaded(true);
      return res.data;
    } catch (err) {
      console.error("[ProductsContext] fetchProducts failed:", err);
      // 실패해도 앱이 죽지 않게만 하고, loaded는 false 유지(재시도 가능)
      return [];
    }
  }, []);

  return (
    <ProductsContext.Provider value={{ products, setProducts, fetchProducts, loaded }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
