import { useState, useEffect, useCallback } from "react";
import { fetchItems, fetchCategories } from "../api/itemApi";

const DEFAULT_FILTERS = {
  search: "",
  type: "",
  category: "",
  scalingGrade: "",
  sort: "name",
  page: 1,
  limit: 20,
};

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Strip empty strings so they don't pollute the query
      const params = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== "")
      );
      const res = await fetchItems(params);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load categories once on mount
  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Re-fetch whenever filters change
  useEffect(() => {
    loadItems(filters);
  }, [filters, loadItems]);

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const setPage = (page) => setFilters((prev) => ({ ...prev, page }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    items,
    categories,
    pagination,
    filters,
    loading,
    error,
    updateFilter,
    setPage,
    resetFilters,
  };
};
