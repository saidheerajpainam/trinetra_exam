import { useEffect, useState } from "react";
import { api, Result } from "@/services/api";
import { FiAlertTriangle, FiCheckCircle, FiCalendar, FiClock } from "react-icons/fi";
import { toast } from "sonner";

export default function MalpracticeReport() {
  const [violations, setViolations] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
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

      const malpracticeResults = mappedResults.filter(
        (res): res is Result & { isMalpractice: true } =>
          (res as any).isMalpractice === true,
      );
      setViolations(malpracticeResults);
    } catch (error: any) {
      toast.error(error.message || "Failed to load malpractice logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Malpractice Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor candidate tab-switching events, screen resizes, and exit prompts.</p>
      </div>

      {violations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs min-h-[350px] flex flex-col justify-center items-center text-center">
          <div className="h-16 w-16 bg-green-50 border border-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <FiCheckCircle className="text-3xl" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Malpractice Detected</h3>
          <p className="text-slate-500 text-xs max-w-sm mt-2 leading-relaxed">
            Active proctoring is enabled. All current candidate browser sessions are running inside the proctored tab boundary.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Exam Subject</th>
                  <th className="px-6 py-4">Detection Time</th>
                  <th className="px-6 py-4 text-right">Violation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {violations.map((violation) => {
                  const dateStr = new Date(violation.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const timeStr = new Date(violation.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={violation.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-none">{violation.user?.name || "Deleted Student"}</h4>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1">{violation.user?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{violation.user?.college || "N/A"}</td>
                      <td className="px-6 py-4 text-slate-650 capitalize text-xs font-bold">{violation.subject}</td>
                      <td className="px-6 py-4 text-slate-500 font-normal">
                        <div className="flex flex-col text-[10px] leading-tight text-slate-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar /> {dateStr}
                          </span>
                          <span className="flex items-center gap-1 mt-1">
                            <FiClock /> {timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border bg-red-50 text-red-700 border-red-100 uppercase tracking-wide">
                          <FiAlertTriangle className="animate-pulse" />
                          TAB ESCAPE AUTO-FAIL
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
