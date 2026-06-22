import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ExamProvider } from "@/context/ExamContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import GeneralInstructions from "@/pages/GeneralInstructions";
import ExamSelection from "@/pages/ExamSelection";
import ExamInstructions from "@/pages/ExamInstructions";
import ExamPage from "@/pages/ExamPage";
import ResultPage from "@/pages/ResultPage";
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
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/instructions" element={<ProtectedRoute><GeneralInstructions /></ProtectedRoute>} />
              <Route path="/exam-selection" element={<ProtectedRoute><ExamSelection /></ProtectedRoute>} />
              <Route path="/exam-instructions/:examId" element={<ProtectedRoute><ExamInstructions /></ProtectedRoute>} />
              <Route path="/exam/:id" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
              <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ExamProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
