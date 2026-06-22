import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, Award, XCircle, CheckCircle } from "lucide-react";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Retrieve the grading details passed from navigation state
  const stateData = location.state as {
    result: {
      resultId: number;
      score: number;
      percentage: number;
      passed: boolean;
      certificateNo: string | null;
    };
    subject: string;
    questions?: any[];
    answers?: Record<string, string>;
  } | null;

  const result = stateData?.result;
  const subject = stateData?.subject;
  const stateQuestions = stateData?.questions;
  const stateAnswers = stateData?.answers;

  // Retrieve questions and answers from state or fallback to localStorage cache
  // Rules of Hooks: Must be called unconditionally at the top level!
  const [questions, setQuestions] = React.useState<any[]>(stateQuestions || []);
  const [answers, setAnswers] = React.useState<Record<string, string>>(stateAnswers || {});

  React.useEffect(() => {
    async function loadReviewDetails() {
      if (!result?.resultId) return;

      try {
        let currentQuestions = stateQuestions || [];
        let currentAnswers = stateAnswers || {};

        // 1. Try loading from localStorage if state is empty or missing correct answers
        const hasQuestions = currentQuestions.length > 0;
        const hasCorrectAnswers = hasQuestions && currentQuestions[0].correctAnswer;

        if (!hasCorrectAnswers) {
          const saved = localStorage.getItem(`trinetra_review_${result.resultId}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.questions && parsed.questions.length > 0 && parsed.questions[0].correctAnswer) {
              currentQuestions = parsed.questions;
              if (parsed.answers) currentAnswers = parsed.answers;
            }
          }
        }

        // 2. Fetch from backend review API as fallback if still missing correct answers
        const finalHasCorrect = currentQuestions.length > 0 && currentQuestions[0].correctAnswer;
        if (!finalHasCorrect) {
          const resData = await api.getResultReview(result.resultId);
          if (resData && resData.questions) {
            currentQuestions = resData.questions;
            localStorage.setItem(
              `trinetra_review_${result.resultId}`,
              JSON.stringify({ questions: currentQuestions, answers: currentAnswers })
            );
          }
        }

        setQuestions(currentQuestions);
        setAnswers(currentAnswers);
      } catch (err) {
        console.error("Failed to load review details:", err);
      }
    }
    loadReviewDetails();
  }, [result?.resultId, stateQuestions, stateAnswers]);

  // Conditional returns must be placed AFTER all hook calls!
  if (!stateData || !result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-650 font-bold">No recent exam submissions found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl text-xs hover:bg-green-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const totalQuestions = questions.length || 10;
  const wrongAnswers = totalQuestions - result.score;

  const getAnswerLabel = (ans: any) => {
    if (ans === undefined || ans === null) return "Not Answered";
    const str = String(ans).trim();
    if (str === "") return "Not Answered";
    return `Option ${str.toUpperCase()}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 animate-fade-in">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100">
        
        {/* Color head Banner */}
        <div className={`p-8 md:p-10 text-center text-white ${result.passed ? "bg-green-600" : "bg-red-500"}`}>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
            {result.passed ? <Award className="text-4xl" /> : <XCircle className="text-4xl" />}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {result.passed ? "Exam Passed!" : "Exam Failed"}
          </h1>
          <p className="mt-2 text-sm opacity-90">Subject: <span className="font-bold capitalize">{subject || ""}</span></p>
        </div>

        {/* Detailed Stats */}
        <div className="p-8 md:p-10 space-y-8">
          <div>
            <h3 className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px] text-center mb-6">Student Report Card</h3>
            
            <div className="space-y-3.5 border-b border-slate-100 pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-semibold">Student Name:</span>
                <span className="text-slate-800 font-bold">{user?.name || ""}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-semibold">Course:</span>
                <span className="text-slate-800 font-bold">{user?.course || ""}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-semibold">College:</span>
                <span className="text-slate-800 font-bold truncate max-w-[250px]">{user?.college || ""}</span>
              </div>
            </div>
          </div>

          {/* Correct vs Wrong grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Total Qs</span>
              <p className="text-slate-800 text-xl font-extrabold mt-1">{totalQuestions}</p>
            </div>
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50 text-center">
              <span className="text-green-600 text-[10px] font-bold uppercase">Correct</span>
              <p className="text-green-700 text-xl font-extrabold mt-1">{result.score}</p>
            </div>
            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100/50 text-center">
              <span className="text-red-500 text-[10px] font-bold uppercase">Wrong</span>
              <p className="text-red-600 text-xl font-extrabold mt-1">{wrongAnswers}</p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-center">
              <span className="text-blue-600 text-[10px] font-bold uppercase">Percentage</span>
              <p className="text-blue-700 text-xl font-extrabold mt-1">{result.percentage}%</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 text-xs font-semibold text-slate-600 border border-slate-100">
            {result.passed ? (
              <>
                <CheckCircle className="text-green-600 text-base shrink-0" />
                <span>Congratulations! You met the 40% passing criteria for this domain.</span>
              </>
            ) : (
              <>
                <XCircle className="text-red-500 text-base shrink-0" />
                <span>You scored under the 40% passing requirement. Please prepare and re-attempt.</span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
            >
              <Home className="w-4 h-4" />
              Back Dashboard
            </button>

            {result.passed && result.certificateNo && (
              <button
                onClick={() => navigate(`/certificate/${result.certificateNo}`)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-purple-600/10"
              >
                <Award className="w-4 h-4" />
                Download Certificate
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Answer Review Section */}
      {questions && Array.isArray(questions) && questions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Answer Review</h2>
          <div className="space-y-4">
            {questions.map((q: any, idx: number) => {
              const studentAns = answers ? answers[String(q.id)] : undefined;
              const isCorrect = studentAns && String(studentAns).toUpperCase() === String(q.correctAnswer || "").toUpperCase();

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect 
                      ? "bg-green-50/20 border-green-200" 
                      : "bg-red-50/20 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm leading-snug">
                        Q{idx + 1}. {q.question}
                      </h4>
                      <div className="flex flex-wrap gap-x-16 gap-y-3 mt-4">
                        <div>
                          <span className="text-slate-400 text-xs font-semibold block mb-1">Your Answer</span>
                          <span className={`inline-block text-xs font-bold text-white rounded-md px-3 py-1 ${
                            isCorrect ? "bg-[#2563eb]" : "bg-red-500"
                          }`}>
                            {getAnswerLabel(studentAns)}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-slate-400 text-xs font-semibold block mb-1">Correct Answer</span>
                            <span className="inline-block text-xs font-bold text-white rounded-md px-3 py-1 bg-[#10b981]">
                              Option {String(q.correctAnswer || "").toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
