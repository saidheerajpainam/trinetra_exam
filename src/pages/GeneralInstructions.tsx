import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MonitorOff, Send, ArrowRight } from "lucide-react";

const rules = [
  { icon: MonitorOff, title: "No Tab Switching", desc: "Switching tabs or windows during the exam will trigger a warning. Repeated violations may auto-submit your test." },
  { icon: Clock, title: "Timer-Based Test", desc: "Each exam has a fixed duration. The timer starts as soon as you begin and cannot be paused." },
  { icon: Send, title: "Auto-Submit", desc: "When the timer reaches zero, your exam will be automatically submitted with whatever answers you have provided." },
  { icon: AlertTriangle, title: "No Going Back", desc: "Once submitted, you cannot retake the exam or change your answers. Make sure to review before submitting." },
];

const GeneralInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight font-['Space_Grotesk']">General Instructions</h1>
          <p className="mt-2 text-muted-foreground">Please read all rules carefully before starting your exam</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rules.map((r) => (
            <Card key={r.title} className="border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <r.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{r.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button size="lg" onClick={() => navigate("/exam-selection")} className="gap-2 px-8">
            Continue to Exam Selection <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GeneralInstructions;
