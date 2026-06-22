import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Result, Certificate } from "@/services/api";
import { Award, Eye } from "lucide-react";
import { toast } from "sonner";

export default function StudentResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResultsAndCerts() {
      try {
        const [resultsData, certsData, examsData] = await Promise.all([
          api.getResults(),
          api.getCertificates(),
          api.getExams(),
        ]);
        setResults(resultsData);
        setCertificates(certsData);
        setExams(examsData);
      } catch (error: any) {
        toast.error(error.message || "Failed to load results history");
      } finally {
        setLoading(false);
      }
    }
    fetchResultsAndCerts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">My Results</h1>
        <p className="text-slate-400 text-sm mt-1">View all your exam attempts and scores</p>
      </div>

      {/* Results Card List */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-500 text-sm">
              You haven't attempted any exams yet. Go to the{" "}
              <span 
                className="text-blue-600 font-bold hover:underline cursor-pointer" 
                onClick={() => navigate("/exam-selection")}
              >
                Exams Section
              </span>{" "}
              to begin.
            </p>
          </div>
        ) : (
          results.map((res) => {
            // Build the date string: 09 Jun 2026 format
            const d = new Date(res.date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = d.toLocaleDateString("en-US", { month: "short" });
            const year = d.getFullYear();
            const dateStr = `${day} ${month} ${year}`;

            // Find matching certificate & exam details
            const matchingCert = certificates.find(
              (c) => c.subject.toLowerCase() === res.subject.toLowerCase()
            );
            const matchingExam = exams.find(
              (e) => e.subject.toLowerCase() === res.subject.toLowerCase()
            );
            const totalQuestions = matchingExam ? matchingExam.totalQuestions : 10;

            return (
              <div 
                key={res.id} 
                className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status Ribbon/Award Icon Container */}
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    res.passed 
                      ? "bg-green-50 border-green-100 text-green-500" 
                      : "bg-red-50 border-red-100 text-red-500"
                  }`}>
                    <Award className="w-6 h-6" />
                  </div>

                  {/* Exam Info */}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 text-base leading-snug truncate">
                      {res.subject.toLowerCase()} question
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                      <span className="bg-[#10b981] text-white px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide">
                        {res.subject === "Reasoning" || res.subject === "Aptitude" || res.subject === "Robotics" || res.subject === "IoT" || res.subject === "Python" || res.subject === "Java"
                          ? res.subject
                          : res.subject === "drones" ? "Drones & Robotics" : res.subject
                        }
                      </span>
                      <span className="text-slate-400 text-xs font-normal">
                        {dateStr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score, Status Pill and Action */}
                <div className="flex items-center gap-6 shrink-0">
                  {/* Score & Status */}
                  <div className="text-right">
                    <div className="text-slate-800 font-bold text-lg leading-none">
                      {res.score}/{totalQuestions}
                    </div>
                    <div className="mt-1">
                      <span className={`inline-block text-[10px] font-bold text-white rounded px-2.5 py-0.5 ${
                        res.passed ? "bg-[#2563eb]" : "bg-red-500"
                      }`}>
                        {res.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => {
                      let savedReview = null;
                      try {
                        const savedReviewStr = localStorage.getItem(`trinetra_review_${res.id}`);
                        if (savedReviewStr) savedReview = JSON.parse(savedReviewStr);
                      } catch (err) {
                        console.error("Failed to parse cached exam review:", err);
                      }

                      navigate("/result", {
                        state: {
                          result: {
                            resultId: res.id,
                            score: res.score,
                            percentage: res.percentage,
                            passed: res.passed,
                            certificateNo: matchingCert ? matchingCert.certificateNo : null
                          },
                          subject: res.subject,
                          questions: savedReview?.questions,
                          answers: savedReview?.answers
                        }
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

