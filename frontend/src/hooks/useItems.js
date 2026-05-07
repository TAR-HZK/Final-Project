import { useState, useCallback } from "react";
import axios from "axios";

// Axios instance — reads token from localStorage automatically
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * useItems — encapsulates all CRUD operations and state for the Item Management page.
 */
export function useItems() {
  const [items,      setItems]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async ({ search = "", type = "", category = "", page = 1, limit = 10 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search)   params.search   = search;
      if (type)     params.type     = type;
      if (category) params.category = category;

      const { data } = await api.get("/items", { params });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create ───────────────────────────────────────────────────────────────
  const createItem = useCallback(async (payload) => {
    setSaving(true);
    try {
      const { data } = await api.post("/items", payload);
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to create item." };
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Update ───────────────────────────────────────────────────────────────
  const updateItem = useCallback(async (id, payload) => {
    setSaving(true);
    try {
      const { data } = await api.put(`/items/${id}`, payload);
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update item." };
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteItem = useCallback(async (id) => {
    try {
      await api.delete(`/items/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to delete item." };
    }
  }, []);

  // ── Toggle availability ───────────────────────────────────────────────────
  const toggleItem = useCallback(async (id) => {
    try {
      const { data } = await api.patch(`/items/${id}/toggle`);
      return { success: true, item: data.item };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to toggle item." };
    }
  }, []);

  return {
    items, total, totalPages,
    loading, saving, error,
    fetchItems, createItem, updateItem, deleteItem, toggleItem,
  };
}
