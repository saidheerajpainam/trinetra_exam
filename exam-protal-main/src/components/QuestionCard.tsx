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

const QuestionCard = ({ question, index, total, selectedOption, onSelect }: QuestionCardProps) => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Question {index + 1} of {total}
      </p>
      <CardTitle className="text-lg leading-relaxed md:text-xl">{question.text}</CardTitle>
    </CardHeader>
    <CardContent>
      <RadioGroup value={selectedOption} onValueChange={onSelect} className="space-y-3">
        {question.options.map((opt) => (
          <Label
            key={opt.id}
            htmlFor={opt.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all hover:bg-muted/50",
              selectedOption === opt.id && "border-primary bg-primary/5 ring-1 ring-primary/30"
            )}
          >
            <RadioGroupItem value={opt.id} id={opt.id} />
            <span className="text-sm leading-relaxed">{opt.text}</span>
          </Label>
        ))}
      </RadioGroup>
    </CardContent>
  </Card>
);

export default QuestionCard;
