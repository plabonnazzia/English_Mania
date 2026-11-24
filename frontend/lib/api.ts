import axios from "axios";

// Phase 1 placeholder — Axios instance wired to NEXT_PUBLIC_API_URL.
// Interceptors (JWT) added in Phase 4.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
});
export default api;
