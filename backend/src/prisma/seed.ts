/**
 * Seed data — Phase 3.
 * Creates sample lessons, mock tests, and questions for ALL 7 exam
 * types through the SAME generic engine (no per-exam code paths):
 *   IELTS x2, GRE x2, TOEFL x1, PTE x1, SAT x1, DET x1, CAE x1
 * (Deliverables checklist: >=2 IELTS + >=2 GRE, >=1 each other.)
 *
 * Also creates dev users (idempotent upserts):
 *   admin@example.com / admin1234   (role ADMIN)
 *   student@example.com / password123 (role STUDENT)
 *
 * Usage: npm run db:seed   (requires DATABASE_URL + migrated DB)
 * Re-running replaces seed tests/lessons (matched by title) but
 * keeps existing users' passwords unless the email is new.
 *
 * Convention: Question.correctAnswer is the exact option text
 * (case-insensitive match on submit). Frontend sends the selected
 * option's text as `answer`.
 */
import bcrypt from "bcrypt";
import { PrismaClient, Role, Section, TestType } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedQuestion {
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
}

interface SeedTest {
  type: TestType;
  section: Section;
  title: string;
  duration: number;
  questions: SeedQuestion[];
}

const TESTS: SeedTest[] = [
  // ---- IELTS (2 tests) ----
  {
    type: TestType.IELTS,
    section: Section.READING,
    title: "IELTS Reading — Sample Test 1",
    duration: 60,
    questions: [
      {
        questionText: "According to the passage, what is the main reason for the decline in bee populations?",
        questionType: "MCQ",
        options: ["Increased honey production", "Pesticide use and habitat loss", "More beekeepers", "Colder winters only"],
        correctAnswer: "Pesticide use and habitat loss",
      },
      {
        questionText: "Which word is closest in meaning to 'rapid' as used in the text?",
        questionType: "MCQ",
        options: ["Slow", "Gradual", "Fast", "Uncertain"],
        correctAnswer: "Fast",
      },
      {
        questionText: "True or False: The passage states that bees are essential for pollination.",
        questionType: "MCQ",
        options: ["True", "False", "Not Given"],
        correctAnswer: "True",
      },
    ],
  },
  {
    type: TestType.IELTS,
    section: Section.LISTENING,
    title: "IELTS Listening — Sample Test 1",
    duration: 30,
    questions: [
      {
        questionText: "The library opens at what time on weekdays?",
        questionType: "MCQ",
        options: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
        correctAnswer: "9:00 AM",
      },
      {
        questionText: "What is the booking reference number mentioned?",
        questionType: "MCQ",
        options: ["A123", "B456", "C789", "D012"],
        correctAnswer: "B456",
      },
      {
        questionText: "How many people are in the group booking?",
        questionType: "MCQ",
        options: ["Two", "Three", "Four", "Five"],
        correctAnswer: "Four",
      },
    ],
  },
  // ---- GRE (2 tests) ----
  {
    type: TestType.GRE,
    section: Section.VERBAL,
    title: "GRE Verbal — Sample Test 1",
    duration: 41,
    questions: [
      {
        questionText: "Choose the word closest in meaning to 'abundant':",
        questionType: "MCQ",
        options: ["Scarce", "Plentiful", "Hidden", "Brief"],
        correctAnswer: "Plentiful",
      },
      {
        questionText: "The scientist's theory was ___ by the new evidence, which contradicted her predictions.",
        questionType: "MCQ",
        options: ["confirmed", "undermined", "expanded", "ignored"],
        correctAnswer: "undermined",
      },
      {
        questionText: "Which sentence best expresses the main idea of the passage?",
        questionType: "MCQ",
        options: [
          "Technology always improves education",
          "Online learning requires self-discipline",
          "Schools should close permanently",
          "Exams are unnecessary",
        ],
        correctAnswer: "Online learning requires self-discipline",
      },
    ],
  },
  {
    type: TestType.GRE,
    section: Section.QUANT,
    title: "GRE Quant — Sample Test 1",
    duration: 41,
    questions: [
      {
        questionText: "If x + 5 = 12, what is the value of x?",
        questionType: "MCQ",
        options: ["5", "6", "7", "17"],
        correctAnswer: "7",
      },
      {
        questionText: "What is 15% of 200?",
        questionType: "MCQ",
        options: ["20", "25", "30", "35"],
        correctAnswer: "30",
      },
      {
        questionText: "A rectangle has length 8 and width 5. What is its area?",
        questionType: "MCQ",
        options: ["13", "26", "40", "45"],
        correctAnswer: "40",
      },
    ],
  },
  // ---- TOEFL (1 test) ----
  {
    type: TestType.TOEFL,
    section: Section.READING,
    title: "TOEFL Reading — Sample Test 1",
    duration: 35,
    questions: [
      {
        questionText: "What does the passage mainly discuss?",
        questionType: "MCQ",
        options: ["The history of bridges", "How bridges are built", "Bridge safety laws", "Famous bridge designers"],
        correctAnswer: "How bridges are built",
      },
      {
        questionText: "The word 'span' in the passage is closest in meaning to:",
        questionType: "MCQ",
        options: ["Length", "Width", "Age", "Cost"],
        correctAnswer: "Length",
      },
    ],
  },
  // ---- PTE (1 test) ----
  {
    type: TestType.PTE,
    section: Section.READING,
    title: "PTE Reading — Sample Test 1",
    duration: 30,
    questions: [
      {
        questionText: "Choose the correct word to complete the sentence: 'She ___ to school every day.'",
        questionType: "MCQ",
        options: ["go", "goes", "going", "gone"],
        correctAnswer: "goes",
      },
      {
        questionText: "Which option is a synonym for 'happy'?",
        questionType: "MCQ",
        options: ["Sad", "Angry", "Joyful", "Tired"],
        correctAnswer: "Joyful",
      },
    ],
  },
  // ---- SAT (1 test) ----
  {
    type: TestType.SAT,
    section: Section.SAT_MATH,
    title: "SAT Math — Sample Test 1",
    duration: 35,
    questions: [
      {
        questionText: "If 3x = 21, what is x?",
        questionType: "MCQ",
        options: ["3", "6", "7", "9"],
        correctAnswer: "7",
      },
      {
        questionText: "What is the slope of the line y = 2x + 3?",
        questionType: "MCQ",
        options: ["1", "2", "3", "5"],
        correctAnswer: "2",
      },
      {
        questionText: "A shirt costs $40 and is discounted by 25%. What is the sale price?",
        questionType: "MCQ",
        options: ["$28", "$30", "$32", "$35"],
        correctAnswer: "$30",
      },
    ],
  },
  // ---- DET (1 test) ----
  {
    type: TestType.DET,
    section: Section.DET_LITERACY,
    title: "DET Literacy — Sample Test 1",
    duration: 30,
    questions: [
      {
        questionText: "Complete the sentence: 'The cat sat ___ the mat.'",
        questionType: "MCQ",
        options: ["on", "under", "behind", "beside"],
        correctAnswer: "on",
      },
      {
        questionText: "Which word completes the pattern: cat, dog, bird, ___?",
        questionType: "MCQ",
        options: ["fish", "car", "tree", "book"],
        correctAnswer: "fish",
      },
    ],
  },
  // ---- Cambridge CAE (1 test, Use of English types) ----
  {
    type: TestType.CAE,
    section: Section.CAMBRIDGE_READING_USE_OF_ENGLISH,
    title: "CAE Reading & Use of English — Sample Test 1",
    duration: 90,
    questions: [
      {
        questionText: "Open cloze: 'She has lived here ___ 2010.' (one word)",
        questionType: "CLOZE",
        correctAnswer: "since",
      },
      {
        questionText: "Word formation: 'The ___ of the bridge took two years.' (CONSTRUCT)",
        questionType: "WORD_FORMATION",
        correctAnswer: "construction",
      },
      {
        questionText: "Choose the correct option: 'If I ___ rich, I would travel the world.'",
        questionType: "MCQ",
        options: ["am", "were", "be", "been"],
        correctAnswer: "were",
      },
    ],
  },
];

const LESSONS: Array<{
  title: string;
  content: string;
  category: TestType;
  order: number;
}> = [
  { title: "IELTS Reading Strategies", content: "Skim for gist, scan for detail, manage time per passage (20 min each).", category: TestType.IELTS, order: 1 },
  { title: "GRE Vocabulary: 100 Essential Words", content: "Learn high-frequency GRE words with example sentences and mnemonics.", category: TestType.GRE, order: 1 },
  { title: "TOEFL Reading: Academic Passages", content: "How to approach academic reading passages and question types.", category: TestType.TOEFL, order: 1 },
  { title: "PTE Reading: Multiple Choice Tactics", content: "Strategies for PTE reading multiple-choice and reorder tasks.", category: TestType.PTE, order: 1 },
  { title: "SAT Math: Algebra Essentials", content: "Linear equations, inequalities, and systems — the SAT algebra core.", category: TestType.SAT, order: 1 },
  { title: "DET Literacy: Interactive Tasks", content: "Practice fill-in-the-blank, read-aloud, and listen-and-type tasks.", category: TestType.DET, order: 1 },
  { title: "CAE Use of English: Cloze & Word Formation", content: "Open cloze, word formation, and key-word transformation techniques.", category: TestType.CAE, order: 1 },
];

async function main(): Promise<void> {
  // Dev users (upsert by email so re-runs keep existing accounts).
  const adminHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: Role.ADMIN },
    create: { name: "Admin User", email: "admin@example.com", password: adminHash, role: Role.ADMIN },
  });
  const studentHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: { name: "Student User", email: "student@example.com", password: studentHash, role: Role.STUDENT },
  });

  // Replace seed lessons/tests by title (idempotent re-runs).
  for (const l of LESSONS) {
    await prisma.lesson.deleteMany({ where: { title: l.title } });
  }
  for (const t of TESTS) {
    const existing = await prisma.test.findMany({ where: { title: t.title }, select: { id: true } });
    for (const e of existing) {
      await prisma.question.deleteMany({ where: { testId: e.id } });
      await prisma.progress.deleteMany({ where: { testId: e.id } });
      await prisma.test.delete({ where: { id: e.id } });
    }
  }

  for (const l of LESSONS) {
    await prisma.lesson.create({ data: l });
  }
  for (const t of TESTS) {
    await prisma.test.create({
      data: {
        type: t.type,
        section: t.section,
        title: t.title,
        duration: t.duration,
        questions: { create: t.questions },
      },
    });
  }

  const counts = await Promise.all([
    prisma.lesson.count(),
    prisma.test.count(),
    prisma.question.count(),
    prisma.user.count(),
  ]);
  // eslint-disable-next-line no-console
  console.log(
    `Seed complete: ${counts[0]} lessons, ${counts[1]} tests, ${counts[2]} questions, ${counts[3]} users.`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
