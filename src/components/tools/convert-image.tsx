"use client";

import { useState, useCallback } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  drawImageToCanvas,
  canvasToBlob,
  downloadBlob,
  formatFileSize,
  FORMAT_OPTIONS,
  getExtensionFromMime,
} from "@/lib/image-utils";

export default function ConvertImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState("image/png");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultBlob(null);
    setResultSize(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImage(file);
      const canvas = drawImageToCanvas(img, img.width, img.height);
      const blob = await canvasToBlob(canvas, targetFormat, 0.92);
      setResultBlob(blob);
      setResultSize(blob.size);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء التحويل");
    } finally {
      setProcessing(false);
    }
  }, [file, targetFormat]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const ext = getExtensionFromMime(targetFormat);
    const name = file.name.replace(/\.[^.]+$/, "") || "converted";
    downloadBlob(resultBlob, `${name}.${ext}`);
  }, [resultBlob, file, targetFormat]);

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت الصورة للتحويل"
        hint="يدعم JPG, PNG, WebP, GIF, BMP"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* صف المعاينة والمعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-sm font-medium text-text-muted mb-3">الصورة الأصلية</p>
          <div className="aspect-video bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
            {preview && (
              <img src={preview} alt="معاينة" className="max-w-full max-h-full object-contain" />
            )}
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {file.name} — {formatFileSize(file.size)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-sm font-medium text-text-muted mb-3">بعد التحويل</p>
          <div className="aspect-video bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
            {resultBlob ? (
              <img
                src={URL.createObjectURL(resultBlob)}
                alt="النتيجة"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p className="text-text-muted text-sm">اضغط &quot;تحويل&quot; للمعاينة</p>
            )}
          </div>
          {resultSize !== null && (
            <p className="mt-2 text-sm text-text-secondary">
              الحجم الجديد: {formatFileSize(resultSize)}
              {file && (
                <span className="text-text-muted mx-1">
                  ({resultSize < file.size ? "🔽" : "🔼"}{" "}
                  {Math.abs(Math.round(((resultSize - file.size) / file.size) * 100))}%)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* أدوات التحكم */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
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
              }}
              className="w-full rounded-lg border border-border bg-bg-main px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3 pt-1">
            <button
              onClick={handleConvert}
              disabled={processing}
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
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResultBlob(null);
                setResultSize(null);
                setError(null);
              }}
              className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
            >
              إعادة
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
