"use client";

import { useState, useCallback, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import type { ProgressEvent } from "@ffmpeg/ffmpeg";
import UploadArea from "./shared/upload-area";
import {
  formatFileSize,
  AUDIO_FORMAT_OPTIONS,
  getFileExtension,
  getFileNameWithoutExt,
  downloadBlob,
} from "@/lib/audio-utils";

// ============================================================
// FFmpeg Singleton — يُحمّل مرة واحدة فقط عبر الجلسة
// ============================================================
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadingPromise: Promise<void> | null = null;
let ffmpegLoadError: string | null = null;

async function getFFmpeg(
  onProgress: (msg: string) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) return ffmpegInstance;

  if (ffmpegLoadError) throw new Error(ffmpegLoadError);

  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise;
    if (ffmpegInstance && ffmpegInstance.loaded) return ffmpegInstance;
    throw new Error(ffmpegLoadError || "فشل تحميل FFmpeg");
  }

  ffmpegLoadingPromise = (async () => {
    const ffmpeg = new FFmpeg();
    ffmpegInstance = ffmpeg;

    // Listen for download progress during load (log messages from core download)
    ffmpeg.on("log", ({ message }) => {
      if (message.includes("Downloading")) {
        onProgress("جاري تنزيل FFmpeg Core...");
      }
    });

    try {
      await ffmpeg.load();
    } catch (e) {
      ffmpegLoadError =
        e instanceof Error ? e.message : "فشل تحميل محرك FFmpeg";
      ffmpegInstance = null;
      throw new Error(ffmpegLoadError);
    }
    ffmpegLoadingPromise = null;
  })();

  await ffmpegLoadingPromise;
  if (!ffmpegInstance || !ffmpegInstance.loaded) {
    throw new Error("فشل تحميل محرك FFmpeg");
  }
  return ffmpegInstance;
}

// ============================================================
// المكوّن الرئيسي
// ============================================================
export default function ConvertAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("mp3");
  const [processing, setProcessing] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [ffmpegStatusMsg, setFfmpegStatusMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const originalExt = file ? getFileExtension(file.name) : "";

  // Ensure FFmpeg is loaded when we have a file
  const ensureFFmpeg = useCallback(async () => {
    if (ffmpegRef.current && ffmpegRef.current.loaded) {
      setFfmpegReady(true);
      return;
    }
    setFfmpegLoading(true);
    setFfmpegStatusMsg("جاري تحميل محرك FFmpeg...");
    setError(null);
    try {
      const ffmpeg = await getFFmpeg((msg) => setFfmpegStatusMsg(msg));
      ffmpegRef.current = ffmpeg;
      setFfmpegReady(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "فشل تحميل محرك FFmpeg"
      );
    } finally {
      setFfmpegLoading(false);
    }
  }, []);

  const handleFile = useCallback(
    async (f: File) => {
      setError(null);
      setResultBlob(null);
      setResultSize(null);
      setProgress(0);
      setFile(f);
      await ensureFFmpeg();
    },
    [ensureFFmpeg]
  );

  const handleConvert = useCallback(async () => {
    if (!file || !ffmpegRef.current) return;
    const ffmpeg = ffmpegRef.current;

    setProcessing(true);
    setError(null);
    setProgress(0);
    setResultBlob(null);
    setResultSize(null);

    const inputName = `input.${originalExt}`;
    const outputName = `output.${targetFormat}`;

    const progressCallback = ({ progress: p }: ProgressEvent) => {
      setProgress(Math.min(Math.round(p * 100), 100));
    };

    ffmpeg.on("progress", progressCallback);

    try {
      // Write input file
      const inputData = new Uint8Array(await file.arrayBuffer());
      await ffmpeg.writeFile(inputName, inputData);

      // Build ffmpeg args based on target format
      const args = [
        "-i",
        inputName,
        // Quality settings per format
        ...(targetFormat === "mp3"
          ? ["-b:a", "192k"]
          : targetFormat === "flac"
          ? ["-compression_level", "5"]
          : targetFormat === "ogg"
          ? ["-b:a", "192k"]
          : targetFormat === "m4a"
          ? ["-b:a", "192k"]
          : []), // WAV: no extra args needed
        "-y",
        outputName,
      ];

      const exitCode = await ffmpeg.exec(args);

      if (exitCode !== 0) {
        throw new Error(
          `فشل التحويل (كود الخروج: ${exitCode}). تأكد من أن الملف سليم والصيغة مدعومة.`
        );
      }

      // Read result
      const outputData = (await ffmpeg.readFile(outputName)) as Uint8Array;
      const mime =
        AUDIO_FORMAT_OPTIONS.find((o) => o.value === targetFormat)?.mime ||
        "audio/mpeg";
      // Uint8Array from FFmpeg may have ArrayBufferLike backing; slice to clean ArrayBuffer
      const buf = (outputData.buffer as ArrayBuffer).slice(
        outputData.byteOffset,
        outputData.byteOffset + outputData.byteLength
      );
      const blob = new Blob([buf], { type: mime });

      setResultBlob(blob);
      setResultSize(blob.size);

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "حدث خطأ أثناء التحويل";
      setError(msg);
      // Cleanup on error too
      try {
        await ffmpeg.deleteFile(inputName);
      } catch {}
      try {
        await ffmpeg.deleteFile(outputName);
      } catch {}
    } finally {
      ffmpeg.off("progress", progressCallback);
      setProcessing(false);
    }
  }, [file, targetFormat, originalExt]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const baseName = getFileNameWithoutExt(file.name);
    const ext = targetFormat;
    downloadBlob(resultBlob, `${baseName}.converted.${ext}`);
  }, [resultBlob, file, targetFormat]);

  const handleReset = useCallback(() => {
    setFile(null);
    setResultBlob(null);
    setResultSize(null);
    setError(null);
    setProgress(0);
  }, []);

  // ============================================================
  // عرض رفع الملف
  // ============================================================
  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        accept="audio/*"
        label="اسحب وأفلت ملف الصوت للتحويل"
        hint="يدعم MP3, WAV, M4A, OGG, FLAC, AAC, WebM"
      />
    );
  }

  // ============================================================
  // عرض تحميل FFmpeg
  // ============================================================
  if (ffmpegLoading) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-lg text-text-secondary">{ffmpegStatusMsg}</p>
        <p className="text-sm text-text-muted mt-2">
          يتم التحميل مرة واحدة فقط — التحويلات التالية ستكون أسرع
        </p>
      </div>
    );
  }

  // ============================================================
  // العرض الرئيسي
  // ============================================================
  return (
    <div className="space-y-6">
      {/* صف المعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الملف الأصلي */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <p className="text-sm font-medium text-text-muted mb-3">
            الملف الأصلي
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
              🎵
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-main truncate">
                {file.name}
              </p>
              <p className="text-sm text-text-secondary">
                {formatFileSize(file.size)} — صيغة{" "}
                <span className="font-mono bg-bg-surface px-1.5 py-0.5 rounded text-xs">
                  {originalExt.toUpperCase() || "؟"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* الملف الناتج */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <p className="text-sm font-medium text-text-muted mb-3">
            بعد التحويل
          </p>
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                resultBlob
                  ? "bg-success/10 text-success"
                  : "bg-bg-surface text-text-muted"
              }`}
            >
              {resultBlob ? "✅" : "⏳"}
            </div>
            <div className="min-w-0">
              {resultBlob ? (
                <>
                  <p className="font-semibold text-text-main truncate">
                    {getFileNameWithoutExt(file.name)}.converted.{targetFormat}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {resultSize !== null && formatFileSize(resultSize)}
                    {resultSize !== null && (
                      <span className="text-text-muted mx-1">
                        (
                        {resultSize < file.size ? "🔽" : "🔼"}{" "}
                        {Math.abs(
                          Math.round(
                            ((resultSize - file.size) / file.size) * 100
                          )
                        )}
                        %)
                      </span>
                    )}
                  </p>
                </>
              ) : processing ? (
                <p className="text-sm text-text-secondary">
                  جاري التحويل... {progress}%
                </p>
              ) : (
                <p className="text-sm text-text-muted">
                  اضغط &quot;تحويل&quot; للبدء
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* أداة التحويل */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* اختيار الصيغة */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              الصيغة المستهدفة
            </label>
            <select
              value={targetFormat}
              onChange={(e) => {
                setTargetFormat(e.target.value);
                setResultBlob(null);
                setResultSize(null);
                setProgress(0);
              }}
              disabled={processing}
              className="w-full rounded-lg border border-border bg-bg-main px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            >
              {AUDIO_FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* أزرار */}
          <div className="flex items-end gap-3 pt-1">
            <button
              onClick={handleConvert}
              disabled={processing || !ffmpegReady}
              className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  جاري التحويل...
                </span>
              ) : (
                "تحويل"
              )}
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                تحميل ⬇️
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={processing}
              className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors disabled:opacity-50"
            >
              إعادة
            </button>
          </div>
        </div>

        {/* شريط التقدم */}
        {processing && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">
                جاري تحويل الصوت...
              </span>
              <span className="text-sm font-semibold text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-bg-surface rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div className="mt-4 rounded-lg bg-danger/5 border border-danger/20 p-4">
            <p className="text-sm text-danger font-medium flex items-center gap-2">
              <span>❌</span> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
