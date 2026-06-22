import { useEffect, useState } from "react";
import { api, Result } from "@/services/api";
import { FiSearch, FiDownload, FiPrinter, FiCheckCircle, FiXCircle, FiCalendar } from "react-icons/fi";
import { toast } from "sonner";

export default function ManageResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchResults = async () => {
    try {
      const [resultsData, studentsData] = await Promise.all([
        api.getResults(),
        api.getStudents(),
      ]);

      const mappedResults = resultsData.map((res) => {
        const userObj = res.user || (res as any).User;
        if (!userObj) {
          const student = studentsData.find((s) => s.id === res.userId);
          if (student) {
            return {
              ...res,
              user: {
                name: student.name,
                email: student.email,
                mobile: student.mobile,
                college: student.college,
              },
            };
          }
        } else if ((res as any).User && !res.user) {
          return {
            ...res,
            user: (res as any).User,
          };
        }
        return res;
      });

      setResults(mappedResults);
    } catch (error: any) {
      toast.error(error.message || "Failed to load results registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Filter Logic
  const filteredResults = results.filter((res) => {
    const studentName = res.user?.name || "";
    const studentEmail = res.user?.email || "";
    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      studentEmail.toLowerCase().includes(search.toLowerCase());

    const matchesSubject = selectedSubject ? res.subject.toLowerCase() === selectedSubject.toLowerCase() : true;
    const matchesStatus =
      selectedStatus === "passed"
        ? res.passed
        : selectedStatus === "failed"
        ? !res.passed
        : true;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Client-side CSV Export Trigger
  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Student Name", "Email", "Mobile", "College", "Subject", "Score", "Percentage", "Status", "Date"];
    const rows = filteredResults.map((res) => [
      res.user?.name || "N/A",
      res.user?.email || "N/A",
      res.user?.mobile || "N/A",
      `"${res.user?.college || "N/A"}"`,
      res.subject,
      res.score,
      `${res.percentage}%`,
      res.passed ? "PASSED" : "FAILED",
      new Date(res.date).toISOString().split("T")[0],
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Trinetra_Exam_Results_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get unique subjects for dropdown
  const uniqueSubjects = Array.from(new Set(results.map((r) => r.subject)));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Printable CSS overrides */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 20px !important;
          }
          .non-printable {
            display: none !important;
          }
          .printable-logs {
            border: none !important;
            box-shadow: none !important;
          }
          .printable-logs table {
            width: 100% !important;
          }
        }
      `}</style>

      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Exam Results</h1>
          <p className="text-slate-500 text-sm mt-1">Review student performance metrics, search logs, and export reports.</p>
        </div>
        <div className="flex gap-3 non-printable shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <FiPrinter />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/10"
          >
            <FiDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs non-printable">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-semibold text-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Subject Filter */}
        <div>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold text-slate-650 capitalize"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-bold text-slate-650"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Pass/Fail Status</option>
            <option value="passed">Passed (≥ 40%)</option>
            <option value="failed">Failed (&lt; 40%)</option>
          </select>
        </div>
      </div>

      {/* Results logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden printable-logs">
        {filteredResults.length === 0 ? (
          <p className="text-slate-500 text-sm p-8 text-center">No exam results recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Correct Answers</th>
                  <th className="px-6 py-4 text-center">Percentage</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {filteredResults.map((res) => {
                  const dateStr = new Date(res.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm leading-none">{res.user?.name || "Deleted User"}</h4>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1">{res.user?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-650 capitalize">{res.subject}</td>
                      <td className="px-6 py-4 text-slate-500 font-normal">
                        <span className="flex items-center gap-1.5 text-xs">
                          <FiCalendar />
                          {dateStr}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-500 text-xs">
                        {res.score} / 10
                      </td>
                      <td className="px-6 py-4 text-center text-slate-800 font-extrabold">
                        {res.percentage}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          res.passed
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {res.passed ? <FiCheckCircle /> : <FiXCircle />}
                          {res.passed ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
