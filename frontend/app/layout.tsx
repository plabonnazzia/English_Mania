import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Test Prep Platform",
  description:
    "Mock tests, lessons and flashcards for IELTS, GRE, TOEFL, PTE, SAT, DET and Cambridge exams.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
