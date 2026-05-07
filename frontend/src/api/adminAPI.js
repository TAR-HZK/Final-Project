import axiosInstance from "./axiosInstance"; // Huzaifa's shared Axios instance

export const fetchDashboardStats = () =>
  axiosInstance.get("/admin/dashboard");
