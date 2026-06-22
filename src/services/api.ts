import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong";
    if (error.response && error.response.data) {
      if (typeof error.response.data === "object" && error.response.data.message) {
        message = error.response.data.message;
      } else if (typeof error.response.data === "string") {
        message = error.response.data;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  college: string;
  course: string;
  role: "STUDENT" | "ADMIN";
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Exam {
  id: number;
  subject: string;
  duration: number;
  totalQuestions: number;
  status: "not_started" | "completed";
  score?: number | null;
  percentage?: number | null;
  passed?: boolean | null;
}

export interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  difficulty?: string;
  questionType?: string;
}

export interface Result {
  id: number;
  userId: number;
  subject: string;
  score: number;
  percentage: number;
  date: string;
  passed: boolean;
  user?: {
    name: string;
    email: string;
    mobile: string;
    college: string;
  };
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
}


export interface Certificate {
  id: number;
  userId: number;
  certificateNo: string;
  subject: string;
  date: string;
  user?: {
    name: string;
  };
}

export interface AdminStats {
  totalStudents: number;
  totalExams: number;
  totalQuestions: number;
  totalResults: number;
  charts: {
    examPerformance: {
      subject: string;
      avgScore: number;
      attempts: number;
    }[];
    studentStatistics: {
      course: string;
      count: number;
    }[];
  };
}

export const api = {
  // Auth API
  register: async (payload: any) => {
    const res = await apiInstance.post<LoginResponse>("/auth/register", payload);
    return res.data;
  },

  login: async (payload: any) => {
    const res = await apiInstance.post<LoginResponse>("/auth/login", payload);
    return res.data;
  },

  adminLogin: async (payload: any) => {
    const res = await apiInstance.post<LoginResponse>("/auth/admin/login", payload);
    return res.data;
  },

  // Student API
  getExams: async () => {
    const res = await apiInstance.get<Exam[]>("/exams");
    return res.data;
  },

  getQuestions: async (subject: string) => {
    const res = await apiInstance.get<{
      examId: number;
      subject: string;
      duration: number;
      questions: Question[];
    }>(`/questions/random?subject=${encodeURIComponent(subject)}`);
    return res.data;
  },

  submitExam: async (payload: { subject: string; answers: Record<number, string>; isMalpractice?: boolean }) => {
    const res = await apiInstance.post<{
      resultId: number;
      score: number;
      percentage: number;
      passed: boolean;
      certificateNo: string | null;
    }>("/exam/submit", payload);
    return res.data;
  },

  getResults: async () => {
    const res = await apiInstance.get<Result[]>("/results");
    return res.data;
  },

  getResultReview: async (resultId: number) => {
    const res = await apiInstance.get<{
      resultId: number;
      subject: string;
      questions: any[];
    }>(`/results/${resultId}/review`);
    return res.data;
  },

  getAnnouncements: async () => {
    const res = await apiInstance.get<Announcement[]>("/announcements");
    return res.data;
  },


  getCertificates: async () => {
    const res = await apiInstance.get<Certificate[]>("/certificates");
    return res.data;
  },

  getCertificate: async (idOrNo: string) => {
    const res = await apiInstance.get<Certificate>(`/certificate/${idOrNo}`);
    return res.data;
  },

  getProfile: async () => {
    const res = await apiInstance.get<User>("/profile");
    return res.data;
  },

  updateProfile: async (payload: any) => {
    const res = await apiInstance.put<{ message: string; user: User }>("/profile", payload);
    return res.data;
  },

  // Admin Management API
  getAdminStats: async () => {
    const res = await apiInstance.get<AdminStats>("/admin/stats");
    return res.data;
  },

  // Admin CRUD - Exams
  addExam: async (payload: { subject: string; duration: number; totalQuestions?: number }) => {
    const res = await apiInstance.post<Exam>("/exams", payload);
    return res.data;
  },

  editExam: async (id: number, payload: { subject?: string; duration?: number; totalQuestions?: number }) => {
    const res = await apiInstance.put<Exam>(`/exams/${id}`, payload);
    return res.data;
  },

  deleteExam: async (id: number) => {
    const res = await apiInstance.delete<{ message: string }>(`/exams/${id}`);
    return res.data;
  },

  // Admin CRUD - Questions
  getQuestionsAdmin: async (examId?: number, search?: string) => {
    let url = "/questions?";
    if (examId) url += `examId=${examId}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    const res = await apiInstance.get<any[]>(url);
    return res.data;
  },

  addQuestion: async (payload: any) => {
    const res = await apiInstance.post<any>("/questions", payload);
    return res.data;
  },

  bulkAddQuestions: async (examId: number, questions: any[]) => {
    const res = await apiInstance.post<{ message: string; count: number }>("/questions/bulk", { examId, questions });
    return res.data;
  },

  editQuestion: async (id: number, payload: any) => {
    const res = await apiInstance.put<any>(`/questions/${id}`, payload);
    return res.data;
  },

  deleteQuestion: async (id: number) => {
    const res = await apiInstance.delete<{ message: string }>(`/questions/${id}`);
    return res.data;
  },

  // Admin CRUD - Students
  getStudents: async (search?: string) => {
    const url = search ? `/students?search=${encodeURIComponent(search)}` : "/students";
    const res = await apiInstance.get<any[]>(url);
    return res.data;
  },

  deleteStudent: async (id: number) => {
    const res = await apiInstance.delete<{ message: string }>(`/students/${id}`);
    return res.data;
  },

  // Admin CRUD - Announcements & Materials
  addAnnouncement: async (payload: { title: string; description: string }) => {
    const res = await apiInstance.post<Announcement>("/announcements", payload);
    return res.data;
  },

  deleteAnnouncement: async (id: number) => {
    const res = await apiInstance.delete<{ message: string }>(`/announcements/${id}`);
    return res.data;
  },


};
