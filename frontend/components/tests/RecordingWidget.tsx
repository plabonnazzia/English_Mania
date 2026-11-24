"use client";

import { useRef, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api";

interface RecordingWidgetProps {
  mode?: "audio" | "video";
  onUploaded: (url: string) => void;
  existingUrl?: string;
}

export default function RecordingWidget({
  mode = "audio",
  onUploaded,
  existingUrl,
}: RecordingWidgetProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === "video",
      });
      const mimeType = mode === "video" ? "video/webm" : "audio/webm";
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await uploadBlob(blob, mode === "video" ? "recording.webm" : "recording.webm");
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Microphone/camera access denied or unavailable."
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const uploadBlob = async (blob: Blob, filename: string) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", blob, filename);
      const res = await api.post<{ url: string }>("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedUrl(res.data.url);
      onUploaded(res.data.url);
    } catch (err) {
      setError(getApiErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={uploading}
            className="rounded-md bg-rose-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {mode === "video" ? "Start Video Recording" : "Start Audio Recording"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Stop Recording
          </button>
        )}

        {uploading && <span className="text-xs text-slate-600">Uploading...</span>}
        {uploadedUrl && !uploading && (
          <span className="text-xs font-medium text-emerald-700">
            ✓ Recording uploaded
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
