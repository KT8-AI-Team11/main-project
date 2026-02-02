import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api" });

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchProducts = useCallback(async () => {
    const res = await api.get("/products");
    setProducts(res.data);
    setLoaded(true);
    return res.data;
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
