import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Question } from "@/services/api";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedOption: string | undefined;
  onSelect: (optionId: string) => void;
}

const QuestionCard = ({ question, index, total, selectedOption, onSelect }: QuestionCardProps) => {
  const options = [
    { id: "A", label: "A. ", text: question.optionA },
    { id: "B", label: "B. ", text: question.optionB },
    { id: "C", label: "C. ", text: question.optionC },
    { id: "D", label: "D. ", text: question.optionD },
  ];

  return (
    <Card className="border border-slate-200 rounded-2xl shadow-md overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          Question {index + 1} of {total}
        </p>
        <CardTitle className="text-base md:text-lg leading-relaxed text-slate-800 font-bold mt-2">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <RadioGroup value={selectedOption} onValueChange={onSelect} className="space-y-3">
          {options.map((opt) => (
            <Label
              key={opt.id}
              htmlFor={opt.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 hover:bg-slate-50",
                selectedOption === opt.id
                  ? "border-green-600 bg-green-50/30 ring-1 ring-green-600/30"
                  : "border-slate-200"
              )}
            >
              <div className="flex items-center h-5">
                <RadioGroupItem value={opt.id} id={opt.id} className="text-green-600 focus:ring-green-500" />
              </div>
              <span className="text-sm font-semibold text-slate-700 leading-relaxed">
                <span className="font-extrabold text-green-700">{opt.label}</span>
                {opt.text}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
