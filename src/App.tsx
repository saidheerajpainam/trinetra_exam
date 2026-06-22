import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ExamProvider } from "@/context/ExamContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminLogin from "@/pages/admin/AdminLogin";

// Layouts
import StudentLayout from "@/layouts/StudentLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Student Pages
import StudentDashboard from "@/pages/student/StudentDashboard";
import ExamSelection from "@/pages/student/ExamSelection";
import ExamInstructions from "@/pages/student/ExamInstructions";
import ExamPage from "@/pages/student/ExamPage";
import ResultPage from "@/pages/student/ResultPage";
import CertificatePage from "@/pages/student/CertificatePage";
import ProfilePage from "@/pages/student/ProfilePage";
import StudentResults from "@/pages/student/StudentResults";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageExams from "@/pages/admin/ManageExams";
import ManageQuestions from "@/pages/admin/ManageQuestions";
import ManageStudents from "@/pages/admin/ManageStudents";
import ManageResults from "@/pages/admin/ManageResults";
import MalpracticeReport from "@/pages/admin/MalpracticeReport";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ExamProvider>
            <Routes>
              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Student Panel Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <StudentLayout>
                      <StudentDashboard />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-selection"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <StudentLayout>
                      <ExamSelection />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-instructions/:examId"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <StudentLayout>
                      <ExamInstructions />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <StudentLayout>
                      <StudentResults />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <StudentLayout>
                      <ProfilePage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/result"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <StudentLayout>
                      <ResultPage />
                    </StudentLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fullscreen Exam and Print Certificate pages */}
              <Route
                path="/exam/:id"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <ExamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificate/:id"
                element={
                  <ProtectedRoute adminOnly={false}>
                    <CertificatePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exams"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                      <ManageExams />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/questions"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                      <ManageQuestions />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                      <ManageStudents />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                      <ManageResults />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/malpractice"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                      <MalpracticeReport />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ExamProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
