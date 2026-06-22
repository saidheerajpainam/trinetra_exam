import { useEffect, useState } from "react";
import { api, AdminStats } from "@/services/api";
import {
  FiUsers,
  FiBookOpen,
  FiHelpCircle,
  FiAward,
  FiPlus,
  FiTrash2,
  FiBell
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#16a34a", "#2563eb", "#ea580c", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Action States
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annLoading, setAnnLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);



  const loadData = async () => {
    try {
      const [statsData, annData] = await Promise.all([
        api.getAdminStats(),
        api.getAnnouncements()
      ]);
      setStats(statsData);
      setAnnouncements(annData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annDesc.trim()) {
      toast.error("Please fill in announcement fields");
      return;
    }

    try {
      setAnnLoading(true);
      await api.addAnnouncement({ title: annTitle, description: annDesc });
      toast.success("Announcement created!");
      setAnnTitle("");
      setAnnDesc("");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create announcement");
    } finally {
      setAnnLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await api.deleteAnnouncement(id);
      toast.success("Announcement deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete announcement");
    }
  };



  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const widgets = [
    { name: "Total Students", value: stats?.totalStudents || 0, icon: FiUsers, color: "text-green-600 bg-green-50 border-green-100" },
    { name: "Total Exams", value: stats?.totalExams || 0, icon: FiBookOpen, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { name: "Total Questions", value: stats?.totalQuestions || 0, icon: FiHelpCircle, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { name: "Total Submissions", value: stats?.totalResults || 0, icon: FiAward, color: "text-orange-600 bg-orange-50 border-orange-100" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time statistics, performance charting, and portal announcements.</p>
      </div>

      {/* Stats Cards Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((w, idx) => {
          const Icon = w.icon;
          return (
            <div key={idx} className={`p-6 bg-white border border-slate-250 rounded-2xl shadow-xs flex items-center gap-5 transition-transform hover:-translate-y-0.5`}>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${w.color}`}>
                <Icon className="text-xl" />
              </div>
              <div>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{w.name}</span>
                <p className="text-slate-850 text-2xl font-black text-slate-800 mt-1">{w.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Exam Performance Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-slate-800 font-bold text-base mb-6">Subject Performance Analysis</h3>
          <div className="h-80 w-full text-xs">
            {stats?.charts?.examPerformance && stats.charts.examPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.examPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subject" tickLine={false} tickFormatter={(v) => v.split(" ")[0]} />
                  <YAxis tickLine={false} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Avg Score"]} />
                  <Legend />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No score performance data available.</div>
            )}
          </div>
        </div>

        {/* Student Statistics Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-slate-800 font-bold text-base mb-6">Enrolled Course Distribution</h3>
          <div className="h-80 w-full text-xs flex flex-col md:flex-row items-center justify-center">
            {stats?.charts?.studentStatistics && stats.charts.studentStatistics.length > 0 ? (
              <>
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.charts.studentStatistics}
                        dataKey="count"
                        nameKey="course"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {stats.charts.studentStatistics.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 md:mt-0 md:ml-6 text-slate-650 shrink-0">
                  {stats.charts.studentStatistics.map((item, idx) => (
                    <div key={idx} className="flex items-center text-xs gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="font-bold truncate max-w-[150px]">{item.course}</span>
                      <span className="text-slate-400 font-normal">({item.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-400">No student course statistics available.</div>
            )}
          </div>
        </div>

      </div>

      {/* Admin Action Panels (Announcements) */}
      <div className="grid grid-cols-1 max-w-2xl gap-8">
        
        {/* Create Announcement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-slate-800 font-bold text-base mb-4 flex items-center gap-1.5">
              <FiBell className="text-blue-600" />
              Manage Portal Announcements
            </h3>
            
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Announcement Title"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                />
              </div>
              <div>
                <textarea
                  required
                  placeholder="Write description/content..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold resize-none"
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={annLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10"
              >
                <FiPlus />
                Publish Announcement
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Active Bulletins</span>
            {announcements.length === 0 ? (
              <p className="text-slate-400 text-xs py-2">No bulletins created yet.</p>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="flex justify-between items-start gap-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-700 text-xs truncate">{ann.title}</h4>
                    <p className="text-slate-500 text-[10px] truncate mt-0.5">{ann.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
