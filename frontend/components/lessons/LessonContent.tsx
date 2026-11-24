import { Lesson } from "@/types";

export default function LessonContent({ lesson }: { lesson: Lesson }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {lesson.category}
        </span>
        <span className="text-xs text-slate-500">Lesson #{lesson.order}</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
        {lesson.title}
      </h1>

      {lesson.videoUrl && (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-black">
          <video
            src={lesson.videoUrl}
            controls
            className="max-h-96 w-full"
          />
        </div>
      )}

      <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-slate-700">
        {lesson.content}
      </div>
    </article>
  );
}
