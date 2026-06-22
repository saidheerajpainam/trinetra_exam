import { useParams, useNavigate } from "react-router-dom";
import { useExam } from "@/context/ExamContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play } from "lucide-react";

const examMeta: Record<string, { title: string; questions: number; duration: number; passing: number }> = {
  reasoning: { title: "Reasoning Exam", questions: 20, duration: 30, passing: 40 },
  aptitude: { title: "Aptitude Exam", questions: 20, duration: 30, passing: 40 },
};

const ExamInstructions = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { startExam } = useExam();
  const meta = examMeta[examId || ""] || examMeta.java;

  const bullets = [
    `Total Questions: ${meta.questions}`,
    `Duration: ${meta.duration} minutes`,
    `Passing Score: ${meta.passing}%`,
    "Each question carries equal marks.",
    "No negative marking.",
    "You can navigate between questions using Next/Previous buttons or the question palette.",
    "The exam will auto-submit when the timer reaches zero.",
    "Tab switching will be detected and warned.",
  ];

  const handleStart = () => {
    startExam(examId || "java", meta.duration);
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight font-['Space_Grotesk']">{meta.title}</h1>
          <p className="mt-2 text-muted-foreground">Review the instructions below before you begin</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed">{b}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleStart} className="gap-2 px-10">
            <Play className="h-4 w-4" /> Start Test
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ExamInstructions;
