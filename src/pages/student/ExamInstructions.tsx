import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExam } from "@/context/ExamContext";
import { api, Exam } from "@/services/api";
import { FiPlay, FiAlertCircle, FiCheck } from "react-icons/fi";
import { toast } from "sonner";

export default function ExamInstructions() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { startExam } = useExam();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExamInfo() {
      try {
        const exams = await api.getExams();
        const found = exams.find((e) => e.id === Number(examId));
        if (!found) {
          toast.error("Exam not found");
          navigate("/exam-selection");
          return;
        }
        setExam(found);
      } catch (error: any) {
        toast.error(error.message || "Failed to load exam details");
      } finally {
        setLoading(false);
      }
    }
    if (examId) fetchExamInfo();
  }, [examId, navigate]);

  const handleStart = () => {
    if (!exam) return;
    // Initialize exam context
    startExam(String(exam.id), exam.duration);
    toast.success(`Exam started: ${exam.subject}`);
    navigate(`/exam/${exam.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!exam) return null;

  const rules = [
    `Total Questions: ${exam.totalQuestions}`,
    `Duration: ${exam.duration} Minutes`,
    `Correct Answers: One mark per question (+1)`,
    `Incorrect Answers: No negative marking (0)`,
    `Timer: Active countdown visible on the screen`,
    `Browser Window: Do not refresh, close, or resize the window`,
    `Timeout: The test will auto-submit when the timer reaches zero`,
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight capitalize">
          {exam.subject} Instructions
        </h1>
        <p className="text-slate-500 text-sm mt-1">Please review the rules carefully before starting the exam.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
          <FiAlertCircle className="text-xl shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            Important: Ensure you have a stable internet connection. Once you click "Start Test", the countdown timer will begin immediately and cannot be paused.
          </p>
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-4">Exam Guidelines & Rules:</h3>
        <ul className="space-y-3.5">
          {rules.map((rule, idx) => (
            <li key={idx} className="flex items-start text-slate-600 text-sm">
              <span className="h-5 w-5 bg-green-50 text-green-600 border border-green-100 rounded-full flex items-center justify-center shrink-0 mr-3 mt-0.5">
                <FiCheck className="text-xs font-bold" />
              </span>
              <span className="leading-relaxed font-medium">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleStart}
          className="px-10 py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-extrabold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-600/20 text-sm"
        >
          <FiPlay />
          Start Test
        </button>
      </div>
    </div>
  );
}
