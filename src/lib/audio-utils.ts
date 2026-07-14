"use client";

/**
 * أدوات مساعدة لتحويل صيغ الصوت باستخدام FFmpeg.wasm
 * جميع العمليات تتم في المتصفح — لا رفع خارجي
 */

/** تنسيق الحجم للقراءة البشرية */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بايت";
  const units = ["بايت", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

/** صيغ الصوت المدعومة */
export const AUDIO_FORMATS: Record<string, string> = {
  "mp3": "MP3",
  "wav": "WAV",
  "m4a": "M4A",
  "ogg": "OGG",
  "flac": "FLAC",
};

/** قائمة الصيغ للاختيار */
export const AUDIO_FORMAT_OPTIONS = [
  { value: "mp3", label: "MP3", mime: "audio/mpeg" },
  { value: "wav", label: "WAV", mime: "audio/wav" },
  { value: "m4a", label: "M4A", mime: "audio/mp4" },
  { value: "ogg", label: "OGG", mime: "audio/ogg" },
  { value: "flac", label: "FLAC", mime: "audio/flac" },
];

/** استخراج امتداد الملف */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/** اسم الملف بدون امتداد */
export function getFileNameWithoutExt(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

/** صيغ الصوت المدعومة للإدخال (MIME types) */
export const SUPPORTED_INPUT_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
  "audio/aac",
  "audio/webm",
  "audio/x-ms-wma",
  "audio/amr",
];

/** تحميل Blob كملف */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
