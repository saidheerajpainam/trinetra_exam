import { useEffect, useState } from "react";
import { api, Exam } from "@/services/api";
import { FiPlus, FiEdit, FiTrash2, FiHelpCircle, FiUpload, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States - Default is empty to trigger empty state card
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [examId, setExamId] = useState("");
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [difficulty, setDifficulty] = useState("Medium");
  const [formLoading, setFormLoading] = useState(false);

  const fetchQuestions = async () => {
    try {
      const qData = await api.getQuestionsAdmin(
        selectedExamId ? Number(selectedExamId) : undefined
      );
      setQuestions(qData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load questions");
    }
  };

  const fetchExams = async () => {
    try {
      const eData = await api.getExams();
      setExams(eData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load exams");
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchQuestions(), fetchExams()]);
      setLoading(false);
    }
    init();
  }, [selectedExamId]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setExamId(selectedExamId || (exams[0]?.id ? String(exams[0].id) : ""));
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setDifficulty("Medium");
    setIsModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setExamId(String(q.examId));
    setQuestion(q.question);
    setOptionA(q.optionA);
    setOptionB(q.optionB);
    setOptionC(q.optionC);
    setOptionD(q.optionD);
    setCorrectAnswer(q.correctAnswer);
    setDifficulty(q.difficulty);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId || !question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const payload = {
      examId: Number(examId),
      question: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctAnswer,
      difficulty,
      questionType: "MCQ",
    };

    try {
      setFormLoading(true);
      if (editingQuestion) {
        await api.editQuestion(editingQuestion.id, payload);
        toast.success("Question updated successfully!");
      } else {
        await api.addQuestion(payload);
        toast.success("Question added successfully!");
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to save question");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await api.deleteQuestion(id);
      toast.success("Question deleted successfully!");
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete question");
    }
  };

  // Functional Bulk Import Trigger
  const handleBulkImport = () => {
    if (!selectedExamId) {
      toast.error("Please select an exam from the dropdown first to import questions into it.");
      return;
    }
    document.getElementById("bulk-csv-input")?.click();
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
          toast.error("CSV file is empty or missing headers");
          return;
        }

        // Helper to parse CSV line preserving quoted commas
        const parseCsvLine = (line: string) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result.map(val => val.replace(/^"|"$/g, ''));
        };

        const parsedQuestions: any[] = [];
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const row = parseCsvLine(line);
          if (row.length < 6) {
            toast.error(`Invalid formatting on line ${i + 1}. Skipped.`);
            continue;
          }

          parsedQuestions.push({
            question: row[0],
            optionA: row[1],
            optionB: row[2],
            optionC: row[3],
            optionD: row[4],
            correctAnswer: String(row[5]).toUpperCase().trim(),
            difficulty: row[6] || "Medium",
          });
        }

        if (parsedQuestions.length === 0) {
          toast.error("No valid questions found to import.");
          return;
        }

        setLoading(true);
        const res = await api.bulkAddQuestions(Number(selectedExamId), parsedQuestions);
        toast.success(`Successfully imported ${res.count} questions!`);
        fetchQuestions();
      } catch (error: any) {
        toast.error(error.message || "Failed to parse CSV file");
      } finally {
        setLoading(false);
        // Reset file input
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  if (loading && exams.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <input
        type="file"
        id="bulk-csv-input"
        accept=".csv"
        onChange={handleCsvFileChange}
        className="hidden"
      />
      
      {/* Top Banner Title & Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">Manage Questions</h1>
          <p className="text-slate-500 text-sm mt-1">Add, edit, and delete MCQ questions</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleBulkImport}
            className="flex-1 sm:flex-initial px-4 py-2.5 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <FiUpload />
            Bulk Import CSV
          </button>
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 transition-all"
          >
            <FiPlus />
            Add Question
          </button>
        </div>
      </div>

      {/* Filter Selection Dropdown */}
      <div className="w-full md:w-80">
        <select
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-semibold text-slate-700 cursor-pointer"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          <option value="">Filter by exam...</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>{exam.subject}</option>
          ))}
        </select>
      </div>

      {/* Questions Data Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden min-h-[400px] flex flex-col justify-center items-center p-6">
        
        {/* EMPTY STATE: If no exam selected */}
        {!selectedExamId ? (
          <div className="text-center space-y-4 max-w-sm">
            <div className="mx-auto h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <FiHelpCircle className="text-3xl" />
            </div>
            <p className="text-slate-500 font-bold text-sm">Select an exam to view its questions</p>
          </div>
        ) : questions.length === 0 ? (
          /* NO QUESTIONS FOUND: If exam selected but question array is empty */
          <div className="text-center space-y-4 max-w-sm">
            <div className="mx-auto h-16 w-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
              <FiHelpCircle className="text-3xl" />
            </div>
            <p className="text-slate-500 font-bold text-sm">No questions found for this exam</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
            >
              Add First Question
            </button>
          </div>
        ) : (
          /* QUESTIONS LIST: If questions exist */
          <div className="w-full divide-y divide-slate-100 self-start text-left">
            {questions.map((q, idx) => (
              <div key={q.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start gap-6 hover:bg-slate-50/20 transition-colors px-2">
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex gap-2 items-center text-xs">
                    <span className="font-extrabold text-slate-450 text-slate-400">Q{idx + 1}.</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-full text-[9px] uppercase tracking-wider">
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-relaxed">{q.question}</h4>
                  
                  {/* Option Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-4 text-xs font-semibold text-slate-600">
                    <div><span className="font-extrabold text-blue-600">A. </span>{q.optionA}</div>
                    <div><span className="font-extrabold text-blue-600">B. </span>{q.optionB}</div>
                    <div><span className="font-extrabold text-blue-600">C. </span>{q.optionC}</div>
                    <div><span className="font-extrabold text-blue-600">D. </span>{q.optionD}</div>
                  </div>
                  
                  <div className="text-xs font-bold text-green-700 bg-green-50/50 border border-green-100/50 px-2.5 py-1 rounded-lg inline-block mt-2">
                    Correct: <span className="font-black text-green-800">{q.correctAnswer}</span>
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative z-10 animate-scale-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-850 mb-6 flex items-center gap-1.5">
              <FiHelpCircle className="text-blue-600" />
              {editingQuestion ? "Edit Question Details" : "Add New Exam Question"}
            </h2>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Subject / Exam</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold text-slate-750"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                  >
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>{exam.subject}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Difficulty Level</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold text-slate-750"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Question Description</label>
                <textarea
                  required
                  placeholder="Enter the question text content..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-805"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              {/* Options A-D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Option A</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter option A"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-805"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Option B</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter option B"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-805"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Option C</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter option C"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-805"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Option D</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter option D"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-805"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                  />
                </div>
              </div>

              {/* Correct Option Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Correct Option Answer</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold text-slate-750"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-md shadow-blue-600/10"
                >
                  {formLoading ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
