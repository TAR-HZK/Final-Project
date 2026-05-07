import axios from "axios";

// Centralized axios instance — uses Huzaifa's interceptor setup
// If he exports an `axiosInstance`, replace this with that import.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Inject JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Fetch paginated + filtered items.
 * @param {Object} params - { search, type, category, scalingGrade, page, limit, sort }
 */
export const fetchItems = (params = {}) =>
  api.get("/api/items", { params }).then((r) => r.data);

export const fetchItemById = (id) =>
  api.get(`/api/items/${id}`).then((r) => r.data);

export const fetchCategories = () =>
  api.get("/api/items/categories").then((r) => r.data);

// Admin-only
export const createItem = (body) =>
  api.post("/api/items", body).then((r) => r.data);

export const updateItem = (id, body) =>
  api.put(`/api/items/${id}`, body).then((r) => r.data);

export const deleteItem = (id) =>
  api.delete(`/api/items/${id}`).then((r) => r.data);
