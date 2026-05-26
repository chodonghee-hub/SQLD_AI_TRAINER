const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const api = {
  baseUrl: BASE_URL,
  headers: (token?: string): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }),
};
