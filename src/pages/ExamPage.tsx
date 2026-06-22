import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExam } from "@/context/ExamContext";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, Clock } from "lucide-react";
import { api, type Question } from "@/services/api";

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { answers, setAnswer, clearExam, startExam, endTime } = useExam();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api.getExam(id)
      .then((exam) => {
        setTitle(exam.title);
        setQuestions(exam.questions);
        if (!endTime) startExam(exam.id, exam.duration);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load exam"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!endTime) return;

    const update = () => {
      const seconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(seconds);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const handleSubmit = useCallback(async () => {
    if (!id || submitting || questions.length === 0) return;

    try {
      setSubmitting(true);
      await api.submitExam(id, answers);
      clearExam();
      navigate("/result");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Submit failed");
      if (error instanceof Error && error.message.toLowerCase().includes("already")) {
        clearExam();
        navigate("/result");
      }
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, clearExam, navigate, submitting, questions.length]);

  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0 && !submitting) {
      handleSubmit();
    }
  }, [timeLeft, questions.length, submitting, handleSubmit]);

  if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Loading your unique question paper...</div>;
  if (error) return <div className="p-10 text-center font-bold text-red-600">{error}</div>;
  if (questions.length === 0) return <div className="p-10 text-center font-bold text-red-600">No questions found.</div>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <div className="sticky top-[73px] z-40 border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h2 className="text-xl font-bold capitalize text-slate-800">{title || `${id} Exam`}</h2>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 font-semibold text-slate-700">
            <Clock size={16} className="text-slate-500" />
            <span className={timeLeft < 60 ? "text-red-600 animate-pulse" : ""}>
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row items-start">
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-40">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Jump to Question</h3>
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
                {questions.map((q, i) => {
                  const isCurrent = i === currentQ;
                  const isAnswered = !!answers[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1"
                          : isAnswered
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <QuestionCard
              question={questions[currentQ]}
              index={currentQ}
              total={questions.length}
              selectedOption={answers[questions[currentQ].id]}
              onSelect={(val) => setAnswer(questions[currentQ].id, val)}
            />

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl font-semibold text-slate-600"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ((p) => p - 1)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentQ < questions.length - 1 ? (
                <Button
                  className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md"
                  onClick={() => setCurrentQ((p) => p + 1)}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 font-semibold text-white shadow-md"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  <Send className="mr-2 h-4 w-4" /> {submitting ? "Submitting..." : "Submit Exam"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
