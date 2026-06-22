export type QuestionItem = {
  question: string;
  options: string[];
  correctAnswer: number;
};

/* ================= REASONING (30) ================= */
export const REASONING_QUESTIONS: QuestionItem[] = [
  { question: "2, 4, 8, 16, ?", options: ["18","24","32","36"], correctAnswer: 2 },
  { question: "3, 9, 27, ?", options: ["54","81","72","90"], correctAnswer: 1 },
  { question: "Find odd: Dog, Cat, Cow, Car", options: ["Dog","Cat","Cow","Car"], correctAnswer: 3 },
  { question: "A=1, B=2… LOGIC=?", options: ["46","47","48","49"], correctAnswer: 0 },
  { question: "AZ, BY, CX, ?", options: ["DW","EV","DU","FV"], correctAnswer: 0 },
  { question: "1, 4, 9, 16, ?", options: ["20","25","30","36"], correctAnswer: 1 },
  { question: "5, 10, 20, 40, ?", options: ["60","70","80","90"], correctAnswer: 2 },
  { question: "7, 14, 28, ?", options: ["42","56","60","64"], correctAnswer: 1 },
  { question: "Find next: A, C, E, G, ?", options: ["H","I","J","K"], correctAnswer: 1 },
  { question: "Odd one: Apple, Banana, Carrot, Mango", options: ["Apple","Banana","Carrot","Mango"], correctAnswer: 2 },

  { question: "If CAT=24, BAT=23, RAT=?", options: ["41","42","43","44"], correctAnswer: 2 },
  { question: "Monday, Tuesday, ?", options: ["Friday","Sunday","Wednesday","Saturday"], correctAnswer: 2 },
  { question: "Cube, Sphere, Cylinder, Circle", options: ["Cube","Sphere","Cylinder","Circle"], correctAnswer: 3 },
  { question: "2, 6, 18, 54, ?", options: ["108","162","216","324"], correctAnswer: 1 },
  { question: "Find odd: Linux, Windows, Oracle, Mac", options: ["Linux","Windows","Oracle","Mac"], correctAnswer: 2 },
  { question: "Z, X, V, T, ?", options: ["R","S","Q","P"], correctAnswer: 0 },
  { question: "Pen, Pencil, Book, Laptop", options: ["Pen","Pencil","Book","Laptop"], correctAnswer: 3 },
  { question: "2, 3, 5, 7, ?", options: ["9","10","11","12"], correctAnswer: 2 },
  { question: "Find pair: Doctor:Hospital :: Teacher:?", options: ["Book","School","Student","Class"], correctAnswer: 1 },
  { question: "3, 6, 9, 12, ?", options: ["13","14","15","16"], correctAnswer: 2 },

  { question: "Find odd: Tiger, Lion, Elephant, Table", options: ["Tiger","Lion","Elephant","Table"], correctAnswer: 3 },
  { question: "1, 3, 6, 10, ?", options: ["12","14","15","16"], correctAnswer: 2 },
  { question: "If 8:64 then 6:?", options: ["12","18","36","48"], correctAnswer: 2 },
  { question: "Circle, Square, Triangle, Apple", options: ["Circle","Square","Triangle","Apple"], correctAnswer: 3 },
  { question: "A, D, G, J, ?", options: ["L","M","N","O"], correctAnswer: 1 },
  { question: "Find next: 11, 22, 33, ?", options: ["40","44","55","66"], correctAnswer: 1 },
  { question: "Which odd: CPU, RAM, HDD, Mouse", options: ["CPU","RAM","HDD","Mouse"], correctAnswer: 3 },
  { question: "Find next: 121,144,169,?", options: ["196","225","256","289"], correctAnswer: 0 },
  { question: "Find odd: Rose, Lily, Lotus, Carrot", options: ["Rose","Lily","Lotus","Carrot"], correctAnswer: 3 },
  { question: "2, 5, 10, 17, ?", options: ["24","25","26","27"], correctAnswer: 2 },
];

/* ================= APTITUDE (30) ================= */
export const APTITUDE_QUESTIONS: QuestionItem[] = [
  { question: "25+17=?", options: ["40","42","45","48"], correctAnswer: 1 },
  { question: "15% of 200=?", options: ["20","25","30","35"], correctAnswer: 2 },
  { question: "12×8=?", options: ["84","86","96","98"], correctAnswer: 2 },
  { question: "Square of 9?", options: ["72","81","91","99"], correctAnswer: 1 },
  { question: "100÷4=?", options: ["20","25","30","40"], correctAnswer: 1 },

  { question: "7×9=?", options: ["56","63","72","81"], correctAnswer: 1 },
  { question: "Average of 10,20,30?", options: ["15","20","25","30"], correctAnswer: 1 },
  { question: "20% of 150?", options: ["20","25","30","35"], correctAnswer: 2 },
  { question: "11²=?", options: ["111","121","131","141"], correctAnswer: 1 },
  { question: "144÷12=?", options: ["10","11","12","13"], correctAnswer: 2 },

  { question: "LCM 12,18?", options: ["36","48","54","72"], correctAnswer: 0 },
  { question: "2x+3=11, x=?", options: ["2","3","4","5"], correctAnswer: 2 },
  { question: "Speed 60km/h for 3h distance?", options: ["120","150","180","200"], correctAnswer: 2 },
  { question: "Simple Interest 1000@10% 1yr?", options: ["50","100","150","200"], correctAnswer: 1 },
  { question: "Ratio 20:40=?", options: ["1:4","1:3","1:2","2:3"], correctAnswer: 2 },

  { question: "5 workers×10 days work?", options: ["40","50","60","70"], correctAnswer: 1 },
  { question: "15 km/l for 60km fuel?", options: ["2","3","4","5"], correctAnswer: 2 },
  { question: "18+6÷3=?", options: ["6","8","20","24"], correctAnswer: 2 },
  { question: "Dozen=12, 3 dozen=?", options: ["24","30","36","42"], correctAnswer: 2 },
  { question: "500-10% discount=?", options: ["450","460","470","480"], correctAnswer: 0 },

  { question: "Find %: 50/200?", options: ["10%","20%","25%","30%"], correctAnswer: 2 },
  { question: "3²+4²=?", options: ["12","25","24","30"], correctAnswer: 1 },
  { question: "x²=16, x=?", options: ["2","4","-4","±4"], correctAnswer: 3 },
  { question: "Find avg: 5,10,15?", options: ["8","9","10","11"], correctAnswer: 2 },
  { question: "120÷5=?", options: ["20","22","24","25"], correctAnswer: 2 },

  { question: "8×12=?", options: ["84","96","100","108"], correctAnswer: 1 },
  { question: "Area square side 4?", options: ["8","12","16","20"], correctAnswer: 2 },
  { question: "Perimeter square 4?", options: ["8","12","16","20"], correctAnswer: 2 },
  { question: "Half of 200?", options: ["50","75","100","150"], correctAnswer: 2 },
  { question: "Double of 45?", options: ["80","85","90","95"], correctAnswer: 2 },
];

/* ================= CODING MCQ (20) ================= */
export const CODING_QUESTIONS: QuestionItem[] = [
  { question: "Binary search complexity?", options: ["O(n)","O(log n)","O(n²)","O(1)"], correctAnswer: 1 },
  { question: "Stack uses?", options: ["FIFO","LIFO","Random","None"], correctAnswer: 1 },
  { question: "Queue uses?", options: ["FIFO","LIFO","Tree","Graph"], correctAnswer: 0 },
  { question: "BFS complexity?", options: ["O(V+E)","O(n²)","O(n)","O(log n)"], correctAnswer: 0 },
  { question: "Primary key?", options: ["Unique","Duplicate","Null","Optional"], correctAnswer: 0 },

  { question: "NoSQL DB?", options: ["MySQL","MongoDB","Oracle","Postgres"], correctAnswer: 1 },
  { question: "Which is OS?", options: ["Linux","Oracle","MySQL","HTML"], correctAnswer: 0 },
  { question: "Quick sort avg?", options: ["O(n)","O(n log n)","O(n²)","O(log n)"], correctAnswer: 1 },
  { question: "Deadlock in?", options: ["CPU","OS","DB","RAM"], correctAnswer: 1 },
  { question: "SQL fetch?", options: ["GET","SELECT","FETCH","SHOW"], correctAnswer: 1 },

  { question: "Normalization removes?", options: ["Redundancy","Speed","CPU","RAM"], correctAnswer: 0 },
  { question: "Round Robin is?", options: ["DB","CPU scheduling","Network","Memory"], correctAnswer: 1 },
  { question: "DFS uses?", options: ["Stack","Queue","Tree","Graph"], correctAnswer: 0 },
  { question: "Heap is?", options: ["Tree","Graph","Queue","Stack"], correctAnswer: 0 },
  { question: "Index improves?", options: ["Speed","Memory","CPU","None"], correctAnswer: 0 },

  { question: "Compiler converts?", options: ["High→Low","Low→High","Binary→Text","None"], correctAnswer: 0 },
  { question: "Array index starts?", options: ["0","1","-1","2"], correctAnswer: 0 },
  { question: "Function recursion?", options: ["Self-call","Loop","Jump","None"], correctAnswer: 0 },
  { question: "HTTP stands for?", options: ["HyperText Transfer Protocol","HighText","Hyper Transfer","None"], correctAnswer: 0 },
  { question: "Cloud example?", options: ["AWS","CPU","RAM","USB"], correctAnswer: 0 },
];

/* ================= GATE (20) ================= */
export const GATE_QUESTIONS: QuestionItem[] = [
  { question: "Derivative of x³?", options: ["3x²","2x","x²","3x"], correctAnswer: 0 },
  { question: "log10(1000)?", options: ["1","2","3","4"], correctAnswer: 2 },
  { question: "Determinant [[1,2],[3,4]]?", options: ["-2","2","4","-4"], correctAnswer: 0 },
  { question: "Eigenvalue identity matrix?", options: ["0","1","2","n"], correctAnswer: 1 },
  { question: "Integral 1/x dx?", options: ["lnx","x","e^x","x²"], correctAnswer: 0 },

  { question: "Solve x²-5x+6=0", options: ["2,3","1,6","2,4","3,4"], correctAnswer: 0 },
  { question: "Probability head coin?", options: ["0","0.25","0.5","1"], correctAnswer: 2 },
  { question: "LCM 24,36?", options: ["48","60","72","96"], correctAnswer: 2 },
  { question: "Speed×Time=?", options: ["Distance","Force","Work","Power"], correctAnswer: 0 },
  { question: "Matrix inverse exists when?", options: ["0","≠0","1","-1"], correctAnswer: 1 },

  { question: "sin²x+cos²x=?", options: ["0","1","2","-1"], correctAnswer: 1 },
  { question: "Rank matrix max?", options: ["Rows","Cols","Min","Max"], correctAnswer: 2 },
  { question: "Laplace eq type?", options: ["Linear","Nonlinear","Random","None"], correctAnswer: 0 },
  { question: "Power unit?", options: ["Watt","Volt","Ampere","Ohm"], correctAnswer: 0 },
  { question: "Ohm law?", options: ["V=IR","P=VI","I=V/R","R=VI"], correctAnswer: 0 },

  { question: "FFT complexity?", options: ["n","nlogn","n²","logn"], correctAnswer: 1 },
  { question: "Binary to decimal 101?", options: ["4","5","6","7"], correctAnswer: 1 },
  { question: "Probability range?", options: ["0-1","1-10","-1 to1","0-100"], correctAnswer: 0 },
  { question: "Unit vector magnitude?", options: ["0","1","2","∞"], correctAnswer: 1 },
  { question: "Integration x dx?", options: ["x²/2","x²","x","1/x"], correctAnswer: 0 },
];