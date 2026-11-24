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
