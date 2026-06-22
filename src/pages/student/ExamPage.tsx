import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExam } from "@/context/ExamContext";
import QuestionCard from "@/components/QuestionCard";
import { api, Question } from "@/services/api";
import { FiChevronLeft, FiChevronRight, FiCheckSquare, FiClock } from "react-icons/fi";
import { toast } from "sonner";
import logo from "@/assets/trinetra-logo.png";

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { answers, setAnswer, clearExam, endTime } = useExam();

  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // default 30 mins
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submitTriggered = useRef(false);
  const isAlertOpen = useRef(false);

  // Load questions
  useEffect(() => {
    async function loadQuestions() {
      try {
        // Fetch exams to map ID -> subject name
        const exams = await api.getExams();
        const currentExam = exams.find((e) => e.id === Number(id));
        if (!currentExam) {
          toast.error("Exam not found");
          navigate("/exam-selection");
          return;
        }

        if (currentExam.status === "completed") {
          toast.info("You already completed this exam");
          navigate("/dashboard");
          return;
        }

        setSubject(currentExam.subject);
        
        // Fetch 10 random questions for this exam
        const questionsResponse = await api.getQuestions(currentExam.subject);
        setQuestions(questionsResponse.questions);
      } catch (error: any) {
        toast.error(error.message || "Failed to load exam questions");
        navigate("/exam-selection");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadQuestions();
  }, [id, navigate]);

  // Intercept tab reload / close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submitTriggered.current) return;
      e.preventDefault();
      e.returnValue = "Warning: Leaving this page will submit your exam. Are you sure you want to exit?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleSubmit = useCallback(async (isMalpracticeSubmission = false) => {
    if (submitTriggered.current || submitting) return;

    // Ensure isMalpractice is strictly a boolean to avoid passing MouseEvent objects to the API
    const isMalpractice = isMalpracticeSubmission === true;

    submitTriggered.current = true;
    setSubmitting(true);

    try {
      // Map Answers Record<string, string>
      const formattedAnswers: Record<number, string> = {};
      questions.forEach((q) => {
        formattedAnswers[q.id] = answers[String(q.id)] || "";
      });

      const result = await api.submitExam({
        subject,
        answers: formattedAnswers,
        isMalpractice
      });

      // Clear local exam caching
      clearExam();

      if (id) {
        sessionStorage.removeItem(`trinetra_exam_warning_${id}`);
      }

      // Merge backend correct answers into the questions array
      const reviewQuestions = questions.map((q) => {
        const correctQ = (result as any).questions?.find((rq: any) => rq.id === q.id);
        return {
          ...q,
          correctAnswer: correctQ ? correctQ.correctAnswer : ""
        };
      });

      // Cache review questions and student answers locally for historic review
      try {
        localStorage.setItem(
          `trinetra_review_${result.resultId}`,
          JSON.stringify({ questions: reviewQuestions, answers })
        );
      } catch (err) {
        console.error("Failed to save exam review state to localStorage:", err);
      }

      if (isMalpractice) {
        toast.error("Exam submitted automatically due to proctoring violation (Malpractice)!");
      } else {
        toast.success("Exam submitted successfully!");
      }

      // Navigate to results page passing the score details and review data
      navigate("/result", { 
        state: { 
          result, 
          subject, 
          questions: reviewQuestions, 
          answers 
        } 
      });
    } catch (error: any) {
      toast.error(error.message || "Submission failed");
      submitTriggered.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [id, questions, answers, subject, clearExam, navigate, submitting]);

  // Proctoring: Tab focus loss / minimize detection
  useEffect(() => {
    if (!id || loading || questions.length === 0 || submitTriggered.current) return;

    const warningKey = `trinetra_exam_warning_${id}`;

    const handleViolation = () => {
      if (submitTriggered.current || isAlertOpen.current) return;

      const hasWarning = sessionStorage.getItem(warningKey) === "true";

      if (!hasWarning) {
        sessionStorage.setItem(warningKey, "true");
        isAlertOpen.current = true;
        alert(
          "WARNING: Tab-switching or leaving the exam screen is strictly prohibited!\n\nThis is your ONE-TIME WARNING. If you leave this page/tab again, your exam will be automatically submitted as MALPRACTICE."
        );
        isAlertOpen.current = false;
      } else {
        sessionStorage.removeItem(warningKey);
        handleSubmit(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, loading, questions, handleSubmit]);

  // Handle countdown timer (Display: 00:30:00)
  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remainingSeconds);

      if (remainingSeconds === 0 && !submitTriggered.current) {
        clearInterval(interval);
        toast.warning("Time is up! Submitting your exam automatically.");
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, handleSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-slate-600 font-semibold text-sm">Generating your unique question paper...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  // Formatting seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Exam Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-xs">
        <img
          src={logo}
          alt="Trinetra Drones & Robotics"
          className="h-[36px] md:h-[45px] transition-all"
        />
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm md:text-base">
          <FiClock className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-slate-500"} />
          <span className={timeLeft < 60 ? "text-red-600 font-black animate-pulse" : ""}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Main Exam Panel */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Question Palette */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:sticky lg:top-24">
          <h3 className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px] mb-4">Question Palette</h3>
          <div className="grid grid-cols-5 gap-2.5 lg:grid-cols-4">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQ;
              const isAnswered = !!answers[String(q.id)];

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(idx)}
                  className={`h-10 w-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                    isCurrent
                      ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20 ring-2 ring-green-600/30"
                      : isAnswered
                      ? "bg-green-50 text-green-700 border-green-200 font-black"
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Side: Active Question */}
        <div className="flex-1 w-full space-y-6">
          <QuestionCard
            question={questions[currentQ]}
            index={currentQ}
            total={questions.length}
            selectedOption={answers[String(questions[currentQ].id)]}
            onSelect={(val) => setAnswer(String(questions[currentQ].id), val)}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((p) => p - 1)}
              className="px-5 py-3 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <FiChevronLeft className="text-lg" />
              Previous
            </button>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ((p) => p + 1)}
                className="px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shadow-md shadow-green-600/10"
              >
                Next
                <FiChevronRight className="text-lg" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-65 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/15"
              >
                <FiCheckSquare className="text-lg" />
                {submitting ? "Submitting..." : "Submit Exam"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
