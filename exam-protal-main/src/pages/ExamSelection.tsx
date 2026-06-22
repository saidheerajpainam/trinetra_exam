import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { api, type Exam } from "@/services/api";

const icons: Record<string, string> = {
  reasoning: "🧠",
  aptitude: "📊",
  coding: "💻",
  gate: "🎓",
};

export default function ExamSelection() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getExams()
      .then(setExams)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load exams"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-6">
        <h1 className="text-3xl font-bold text-center mb-2">Choose Your Exam</h1>
        <p className="text-center text-gray-500 mb-10">Select a subject to start. Questions are assigned randomly from MySQL.</p>

        {loading && <p className="text-center font-semibold text-blue-600">Loading exams...</p>}
        {error && <p className="text-center font-semibold text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={() => exam.status === "completed" ? null : navigate(`/exam/${exam.id}`)}
              className={`bg-white p-6 rounded-xl shadow transition duration-200 ${exam.status === "completed" ? "opacity-70" : "hover:shadow-lg cursor-pointer"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-4xl mb-3">{icons[exam.id] || "📝"}</div>
                {exam.status === "completed" && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Completed {exam.score}%</span>
                )}
              </div>

              <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
              <p className="text-gray-600 mb-4 text-sm">{exam.description}</p>

              <div className="text-sm text-gray-500 flex gap-4">
                <span>📄 {exam.totalQuestions} Questions</span>
                <span>⏱ {exam.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
