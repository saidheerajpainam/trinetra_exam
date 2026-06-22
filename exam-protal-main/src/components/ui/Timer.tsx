import { useEffect, useState } from "react";

type Props = {
  minutes: number;
  onTimeUp: () => void;
};

export default function Timer({ minutes, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(minutes * 60);

  useEffect(() => {
    if (!minutes) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes]);

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  return (
    <div className="text-red-600 font-bold text-lg">
      ⏱ {min}:{sec.toString().padStart(2, "0")}
    </div>
  );
}