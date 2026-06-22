// Shuffle utility for arrays and questions

/* Generic shuffle (works for any type) */
export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // swap elements
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

/* Shuffle full question list */
export function shuffleQuestions<T>(questions: T[]): T[] {
  return shuffleArray(questions);
}

/* OPTIONAL (Advanced): shuffle options inside each question */
export function shuffleQuestionsWithOptions(
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[]
) {
  return shuffleArray(
    questions.map((q) => {
      const optionIndexes = q.options.map((_, i) => i);
      const shuffledIndexes = shuffleArray(optionIndexes);

      const newOptions = shuffledIndexes.map((i) => q.options[i]);

      const newCorrectAnswer = shuffledIndexes.indexOf(q.correctAnswer);

      return {
        ...q,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      };
    })
  );
}