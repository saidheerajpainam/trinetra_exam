const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message || `Request failed (${res.status})`);
  }

  return body as T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  hallTicket?: string;
  idType?: string;
  userId?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  idType: string;
  collegeId?: string;
  hallTicket: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  status: "not_started" | "completed";
  score?: number | null;
}

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
}

export interface ExamData {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
}

export interface ResultData {
  examTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  passed: boolean;
  answers: { questionId: string; selected: string; correct: string; isCorrect: boolean }[];
}

export const api = {
  register: (payload: RegisterPayload) =>
    request<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getExams: () => request<Exam[]>("/exams"),

  getExam: (id: string) => request<ExamData>(`/exam/${id}`),

  submitExam: (examId: string, answers: Record<string, string>) =>
    request<{ resultId: string }>("/submit", {
      method: "POST",
      body: JSON.stringify({ examId, answers }),
    }),

  getResult: (userId: string) => request<ResultData>(`/result/${userId}`),
};
