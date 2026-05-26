import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sqld_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    apiClient.post('/auth/register', { username, email, password }),
  guest: () => apiClient.post('/auth/guest'),
};

// ── Questions ─────────────────────────────────────────
export interface QuestionFilters {
  chapter_name?: string;
  difficulty?: string;
  question_type?: string;
  page?: number;
  size?: number;
}

export const questionsApi = {
  list: (filters: QuestionFilters) =>
    apiClient.get('/questions', { params: filters }),
  detail: (id: number) =>
    apiClient.get(`/questions/${id}`),
};

// ── Logs ──────────────────────────────────────────────
export const logsApi = {
  submit: (question_id: number, selected: number, is_correct: boolean) =>
    apiClient.post('/logs', { question_id, selected_answer: selected, is_correct }),
};

// ── Predict ───────────────────────────────────────────
export const predictApi = {
  errorProb: (user_id: string, question_id: number) =>
    apiClient.post('/predict', { user_id, question_id }),
};

// ── Explain ───────────────────────────────────────────
export const explainApi = {
  explain: (question_id: number) =>
    apiClient.post('/explain', { question_id }),
};

// ── Progress ──────────────────────────────────────────
export const progressApi = {
  get: (user_id: string) =>
    apiClient.get(`/progress/${user_id}`),
};

// ── Recommend ─────────────────────────────────────────
export const recommendApi = {
  get: (user_id: string, top_n = 10, use_zpd = true) =>
    apiClient.post(`/recommend/${user_id}`, { top_n, use_zpd }),
};
