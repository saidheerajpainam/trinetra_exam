import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Home, Trophy } from "lucide-react";
import { api, type ResultData } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function ResultPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    api.getResult(user.id)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : "Result not found"));
  }, [user?.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="p-10 text-center">
          <p className="mb-4 font-bold text-red-600">{error}</p>
          <Button onClick={() => navigate("/exam-selection")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!result) return <div className="min-h-screen bg-slate-50 p-10 text-center font-bold text-indigo-600">Loading result...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100">
          <div className={`p-10 text-center text-white ${result.passed ? "bg-green-600" : "bg-red-500"}`}>
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              {result.passed ? <Trophy size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              {result.passed ? "Congratulations!" : "Needs Improvement"}
            </h1>
            <p className="mt-2 text-lg font-medium opacity-90">You have completed the {result.examTitle}</p>
          </div>

          <div className="p-10">
            <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-slate-400">Exam Summary</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">Your Score</p>
                <p className="mt-1 text-3xl font-black text-indigo-600">{result.percentage}%</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">Correct Answers</p>
                <p className="mt-1 text-3xl font-black text-slate-800">
                  {result.correctAnswers} <span className="text-lg text-slate-400">/ {result.totalQuestions}</span>
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-4 text-sm font-medium text-slate-600">
              {result.passed ? (
                <><CheckCircle size={18} className="text-green-500" /> You passed the assessment minimum requirement.</>
              ) : (
                <><XCircle size={18} className="text-red-500" /> You did not meet the 40% passing requirement.</>
              )}
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => navigate("/exam-selection")}
                className="h-14 rounded-2xl bg-indigo-600 px-10 text-lg font-bold text-white shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                <Home className="mr-2 h-5 w-5" /> Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
