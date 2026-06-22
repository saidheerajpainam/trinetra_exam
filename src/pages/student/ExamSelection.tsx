import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Exam } from "@/services/api";
import { FiClock, FiHelpCircle, FiChevronRight, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

// Icons mapping for branding each domain
const domainIcons: Record<string, string> = {
  "reasoning exam": "🧠",
  "aptitude exam": "📊",
  "robotics exam": "🤖",
  "iot exam": "🌐",
  "drones exam": "🛸",
  "python exam": "🐍",
  "java exam": "☕",
};

const domainDescriptions: Record<string, string> = {
  "reasoning exam": "Test your logical deduction, verbal reasoning, pattern completion, and analytical thinking capabilities.",
  "aptitude exam": "Assess your quantitative aptitude, mathematical computation skills, average, simple interest, and problem solving speed.",
  "robotics exam": "Demonstrate knowledge in kinematics, actuators, degrees of freedom, end effectors, and robotic operating systems (ROS).",
  "iot exam": "Evaluate expertise in sensor communication, MQTT protocol, low-power networks (LoRaWAN), and smart hardware gateways.",
  "drones exam": "Show proficiency in Unmanned Aerial Vehicle (UAV) aerodynamics, flight controllers, ESCs, LiPo battery management, and yaw yaw control.",
  "python exam": "Verify coding knowledge in variables, mutable collections (lists), decorators, file operations, error handling, and object orientation.",
  "java exam": "Examine object-oriented principles, JVM structures, garbage collection, garbage recovery, memory references, and java inheritance.",
};

export default function ExamSelection() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await api.getExams();
        setExams(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load exams list");
      } finally {
        setLoading(false);
      }
    }
    loadExams();
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
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Examination Domains</h1>
        <p className="text-slate-500 text-sm mt-1">Select an active domain to begin your online examination. You have 30 minutes to complete 10 questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.filter((exam) => exam.status !== "completed").length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            You have completed all available examinations!
          </div>
        ) : (
          exams
            .filter((exam) => exam.status !== "completed")
            .map((exam) => {
              const subjectLower = exam.subject.toLowerCase();
              const icon = domainIcons[subjectLower] || "📝";
              const desc = domainDescriptions[subjectLower] || "Validate your skills in this professional domain to earn your certificate.";

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-300 flex flex-col justify-between hover:border-green-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-4xl filter drop-shadow-xs">{icon}</span>
                      <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full border border-blue-100">
                        Available
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 capitalize mt-4">{exam.subject}</h3>
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed">{desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <div className="flex justify-between items-center text-slate-500 text-xs mb-4">
                      <span className="flex items-center">
                        <FiHelpCircle className="mr-1 text-slate-400" />
                        {exam.totalQuestions} Questions
                      </span>
                      <span className="flex items-center">
                        <FiClock className="mr-1 text-slate-400" />
                        {exam.duration} Minutes
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/exam-instructions/${exam.id}`)}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-1 shadow-md shadow-green-600/10"
                    >
                      Start Exam
                      <FiChevronRight />
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
