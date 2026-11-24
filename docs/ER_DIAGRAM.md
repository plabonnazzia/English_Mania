# ER Diagram — English Test Prep Platform

![ER Diagram](ER_DIAGRAM.png)

Generated from `backend/src/prisma/schema.prisma` (PROJECT_BRIEF.md
Section 5, implemented in Phase 2). Field/enum names match the
schema exactly. `ER_DIAGRAM.png` (above) is the exported image;
the Mermaid source below is the canonical version-controlled
diagram — render it at <https://mermaid.live> to regenerate.

```mermaid
erDiagram
    USER ||--o{ FLASHCARD : has
    USER ||--o{ PROGRESS : has
    TEST ||--o{ QUESTION : has
    TEST ||--o{ PROGRESS : has
    USER {
        String id PK
        String name
        String email UK
        String password
        Role role
        DateTime createdAt
        DateTime updatedAt
    }
    LESSON {
        String id PK
        String title
        String content
        String videoUrl "nullable"
        TestType category
        Int order
        DateTime createdAt
    }
    TEST {
        String id PK
        TestType type
        Section section
        String title
        Int duration
        DateTime createdAt
    }
    QUESTION {
        String id PK
        String testId FK
        String questionText
        String questionType
        Json options "nullable"
        String correctAnswer
        String audioUrl "nullable"
        String imageUrl "nullable"
    }
    FLASHCARD {
        String id PK
        String userId FK
        String front
        String back
        TestType category
        Float easeFactor
        Int interval
        Int repetitions
        DateTime dueDate
        DateTime createdAt
    }
    PROGRESS {
        String id PK
        String userId FK
        String testId FK
        Float score
        Float maxScore
        Int timeTaken
        DateTime createdAt
    }
    SUBMISSION {
        String id PK
        String userId
        String questionId
        String testId
        String audioUrl "nullable"
        String videoUrl "nullable"
        String textAnswer "nullable"
        Float score "nullable"
        DateTime createdAt
    }
```

## Notes
- `Submission` intentionally has **no Prisma relations** in the
  brief's schema (plain `userId` / `questionId` / `testId` strings)
  — preserved exactly as specified; do not add relations without
  approval (Final Instruction 4).
- Enums: `Role` (STUDENT, ADMIN), `TestType` (IELTS, GRE, TOEFL,
  PTE, SAT, DET, CAE, CPE), `Section` (16 values — see schema).
