import { useEffect, useState } from "react";
import { api, Exam } from "@/services/api";
import { FiPlus, FiEdit, FiTrash2, FiClock, FiHelpCircle } from "react-icons/fi";
import { toast } from "sonner";

export default function ManageExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("10");
  const [formLoading, setFormLoading] = useState(false);

  const fetchExams = async () => {
    try {
      const data = await api.getExams();
      setExams(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openAddModal = () => {
    setEditingExam(null);
    setSubject("");
    setDuration("");
    setTotalQuestions("10");
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setSubject(exam.subject);
    setDuration(String(exam.duration));
    setTotalQuestions(String(exam.totalQuestions));
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !duration) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setFormLoading(true);
      if (editingExam) {
        // Edit Mode
        await api.editExam(editingExam.id, {
          subject: subject.trim(),
          duration: Number(duration),
          totalQuestions: Number(totalQuestions),
        });
        toast.success("Exam updated successfully!");
      } else {
        // Add Mode
        await api.addExam({
          subject: subject.trim(),
          duration: Number(duration),
          totalQuestions: Number(totalQuestions),
        });
        toast.success("Exam created successfully!");
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (error: any) {
      toast.error(error.message || "Failed to save exam details");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exam? All corresponding questions will also be deleted.")) return;

    try {
      await api.deleteExam(id);
      toast.success("Exam deleted successfully!");
      fetchExams();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete exam");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Manage Exams</h1>
          <p className="text-slate-500 text-sm mt-1">Configure subjects, total question allocation limits, and exam durations.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition-all"
        >
          <FiPlus />
          Add New Exam
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <h3 className="font-bold text-slate-800 text-lg capitalize">{exam.subject}</h3>
              <div className="flex gap-4 text-xs text-slate-500 font-semibold mt-4">
                <span className="flex items-center gap-1">
                  <FiClock />
                  {exam.duration} Minutes
                </span>
                <span className="flex items-center gap-1">
                  <FiHelpCircle />
                  {exam.totalQuestions} Questions
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 border-t border-slate-50 pt-4">
              <button
                onClick={() => openEditModal(exam)}
                className="flex-1 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <FiEdit />
                Edit
              </button>
              <button
                onClick={() => handleDeleteExam(exam.id)}
                className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative z-10 animate-scale-up">
            <h2 className="text-lg font-bold text-slate-850 mb-6">
              {editingExam ? "Edit Exam Configuration" : "Add New Exam"}
            </h2>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drones Exam"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-800"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="180"
                  placeholder="e.g. 30"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-800"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Total Questions (Served)</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="100"
                  placeholder="e.g. 10"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-800"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                />
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
                  {formLoading ? "Saving..." : "Save Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
