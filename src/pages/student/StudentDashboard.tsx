import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api, Exam, Result, Announcement, Certificate } from "@/services/api";
import { FiBookOpen, FiAward, FiBell, FiUser, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [examsData, resultsData, announcementsData, certsData] = await Promise.all([
          api.getExams(),
          api.getResults(),
          api.getAnnouncements(),
          api.getCertificates(),
        ]);

        setExams(examsData);
        setResults(resultsData);
        setAnnouncements(announcementsData);
        setCertificates(certsData);
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-6 md:p-8 shadow-lg shadow-green-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-green-50 mt-2 text-sm md:text-base max-w-xl">
            You are enrolled in <span className="font-bold">{user?.course}</span> at <span className="font-bold">{user?.college}</span>. Attempt your available exams below.
          </p>
        </div>
        <Link
          to="/exam-selection"
          className="px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-md shadow-black/5 text-center text-sm"
        >
          View All Exams
        </Link>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Exams & Announcements */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Available Exams */}
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <FiBookOpen className="mr-2.5 text-green-600 text-xl" />
                Available Exams
              </h2>
              <Link to="/exam-selection" className="text-xs font-bold text-green-600 hover:underline flex items-center">
                See all <FiChevronRight className="ml-0.5" />
              </Link>
            </div>
            
            {exams.filter(e => e.status !== "completed").length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No active exams available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.filter(e => e.status !== "completed").slice(0, 4).map((exam) => (
                  <div key={exam.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between transition-all duration-200 hover:border-green-200">
                    <div>
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Active</span>
                      <h3 className="font-bold text-slate-800 text-base mt-2.5 capitalize">{exam.subject}</h3>
                      <p className="text-xs text-slate-500 mt-1">{exam.totalQuestions} Questions | {exam.duration} Mins</p>
                    </div>
                    <button
                      onClick={() => navigate(`/exam-instructions/${exam.id}`)}
                      className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors duration-200"
                    >
                      Start Exam
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Announcements */}
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
              <FiBell className="mr-2.5 text-blue-600 text-xl" />
              Recent Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No announcements posted yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">{ann.title}</h3>
                    <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{ann.description}</p>
                    <span className="text-[10px] text-slate-400 font-medium mt-2.5 block">
                      {new Date(ann.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Certificates & Profile */}
        <div className="space-y-8">

          {/* Certificates */}
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
              <FiAward className="mr-2.5 text-purple-600 text-xl" />
              Certificates
            </h2>
            {certificates.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Complete an exam with ≥ 40% score to earn certificates.</p>
            ) : (
              <div className="space-y-3">
                {certificates.slice(0, 3).map((cert) => (
                  <div key={cert.id} className="p-3.5 bg-purple-50/50 border border-purple-100/50 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs capitalize">{cert.subject} Certificate</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cert.certificateNo}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/certificate/${cert.certificateNo}`)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                    >
                      View PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Previous Results Widget */}
          <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
              <FiUser className="mr-2.5 text-teal-600 text-xl" />
              Recent Scores
            </h2>
            {results.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No results recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 3).map((res) => (
                  <div key={res.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0 border-slate-100">
                    <span className="capitalize font-semibold text-slate-700 truncate pr-3">{res.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{res.percentage}%</span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        res.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {res.passed ? "Pass" : "Fail"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}
