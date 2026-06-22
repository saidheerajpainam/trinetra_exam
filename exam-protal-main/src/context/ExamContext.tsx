import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface ExamState {
  examId: string | null;
  answers: Record<string, string>;
  endTime: number | null;
}

interface ExamContextType extends ExamState {
  startExam: (examId: string, durationMinutes: number) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  clearExam: () => void;
}

const ExamContext = createContext<ExamContextType | null>(null);

function loadState(): ExamState {
  try {
    const answers = JSON.parse(localStorage.getItem("exam_answers") || "{}");
    const examId = localStorage.getItem("exam_id");
    const endTime = Number(localStorage.getItem("exam_time")) || null;
    return { examId, answers, endTime };
  } catch {
    return { examId: null, answers: {}, endTime: null };
  }
}

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExamState>(loadState);

  useEffect(() => {
    localStorage.setItem("exam_answers", JSON.stringify(state.answers));
    if (state.examId) localStorage.setItem("exam_id", state.examId);
    if (state.endTime) localStorage.setItem("exam_time", String(state.endTime));
  }, [state]);

  const startExam = useCallback((examId: string, durationMinutes: number) => {
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    setState({ examId, answers: {}, endTime });
  }, []);

  const setAnswer = useCallback((questionId: string, optionId: string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: optionId } }));
  }, []);

  const clearExam = useCallback(() => {
    localStorage.removeItem("exam_answers");
    localStorage.removeItem("exam_id");
    localStorage.removeItem("exam_time");
    setState({ examId: null, answers: {}, endTime: null });
  }, []);

  return (
    <ExamContext.Provider value={{ ...state, startExam, setAnswer, clearExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
};
