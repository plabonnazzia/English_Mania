export type Role = "STUDENT" | "ADMIN";

export type TestType =
  | "IELTS"
  | "GRE"
  | "TOEFL"
  | "PTE"
  | "SAT"
  | "DET"
  | "CAE"
  | "CPE";

export const ALL_TEST_TYPES: TestType[] = [
  "IELTS",
  "GRE",
  "TOEFL",
  "PTE",
  "SAT",
  "DET",
  "CAE",
  "CPE",
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  category: TestType;
  order: number;
  createdAt: string;
}

export interface ProgressItem {
  id: string;
  userId: string;
  testId: string;
  score: number;
  maxScore: number;
  timeTaken: number;
  createdAt: string;
  test: {
    id: string;
    type: TestType;
    section: string;
    title: string;
  };
}

export interface DashboardStats {
  totalTests: number;
  totalTimeSeconds: number;
  averagePercentage: number;
  flashcardsDue: number;
  totalFlashcards: number;
  byTestType: Record<string, { attempts: number; averagePercentage: number }>;
  recentProgress: ProgressItem[];
}

export interface TestSummary {
  id: string;
  type: TestType;
  section: string;
  title: string;
  duration: number;
  createdAt: string;
  _count?: { questions: number };
}

export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: string[] | null;
  audioUrl: string | null;
  imageUrl: string | null;
}

export interface CorrectAnswerItem {
  questionId: string;
  correctAnswer: string;
  correct: boolean | null;
}

export interface SubmitTestResponse {
  score: number;
  maxScore: number;
  scaledScore: number;
  scale: string;
  percentage: number;
  pendingReview: number;
  correctAnswers: CorrectAnswerItem[];
  progressId: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  category: TestType;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
  createdAt: string;
}
