import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Trash2, Search, Mail, Phone, GraduationCap, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  const fetchStudents = async () => {
    try {
      const data = await api.getStudents(search ? search : undefined);
      setStudents(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load student directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student? All their exam history and certificates will be deleted permanently.")) return;

    try {
      await api.deleteStudent(id);
      toast.success("Student deleted successfully!");
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete student record");
    }
  };

  const toggleExpandStudent = (id: number) => {
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
    } else {
      setExpandedStudentId(id);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Manage Students</h1>
        <p className="text-slate-400 text-sm mt-1">View and manage registered students</p>
      </div>

      {/* Search Bar & Count Badge */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, college..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-normal text-slate-800 placeholder-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="bg-[#10b981] text-white px-3 py-1.5 rounded-md text-xs font-semibold shrink-0">
          {students.length} {students.length === 1 ? "student" : "students"}
        </span>
      </div>

      {/* Students Card List */}
      <div className="space-y-4">
        {students.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-500 text-sm">No student records found.</p>
          </div>
        ) : (
          students.map((student) => {
            const dateStr = new Date(student.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const isExpanded = expandedStudentId === student.id;

            return (
              <React.Fragment key={student.id}>
                <div className={`bg-white border border-slate-200 rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded ? "ring-1 ring-blue-500/20 border-blue-300" : "hover:border-slate-350"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                    <div 
                      className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" 
                      onClick={() => toggleExpandStudent(student.id)}
                    >
                      {/* Circular Avatar */}
                      <div className="h-12 w-12 bg-[#2563eb] text-white rounded-full flex items-center justify-center font-semibold text-lg shrink-0 select-none">
                        {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      
                      {/* Info Details */}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800 text-base leading-snug">
                          {student.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-500 text-xs mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="shrink-0 text-slate-400 w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{student.email}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="shrink-0 text-slate-400 w-3.5 h-3.5" />
                            <span>{student.mobile}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="shrink-0 text-slate-400 w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{student.college}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right-aligned Date and Delete Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-16 sm:pl-0">
                      <span className="text-slate-400 text-xs font-normal">{dateStr}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpandStudent(student.id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            isExpanded 
                              ? "border-blue-200 bg-blue-50 text-blue-600" 
                              : "border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-650"
                          }`}
                          title={isExpanded ? "Hide Test Reports" : "Show Test Reports"}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 border border-red-100 hover:border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Exam Attempts Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-3 border-t border-slate-100 bg-slate-50/40">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          Candidate Test Reports
                        </h4>
                        
                        {(!student.results || student.results.length === 0) ? (
                          <p className="text-slate-400 text-xs italic pl-1">Student has not attempted any exams yet.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {student.results.map((res: any) => (
                              <div key={res.id} className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between shadow-xs">
                                <div>
                                  <h5 className="font-bold text-slate-700 text-xs capitalize">{res.subject}</h5>
                                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                    {new Date(res.date).toLocaleDateString("en-US", { dateStyle: "medium" })}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                                  <span className="text-xs font-bold text-slate-800">{res.percentage}%</span>
                                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                                    res.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                  }`}>
                                    {res.passed ? "PASSED" : "FAILED"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}


