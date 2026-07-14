"use client";

import { useState, useCallback } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  drawImageToCanvas,
  canvasToBlob,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";

export default function CompressImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(70);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultBlob(null);
    setResultPreview(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    // Auto-compress on file load
    const img = await loadImage(f);
    const canvas = drawImageToCanvas(img, img.width, img.height);
    const blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
    setResultBlob(blob);
    setResultPreview(URL.createObjectURL(blob));
  }, [quality]);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImage(file);
      const canvas = drawImageToCanvas(img, img.width, img.height);
      const blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
      setResultBlob(blob);
      if (resultPreview) URL.revokeObjectURL(resultPreview);
      setResultPreview(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء الضغط");
    } finally {
      setProcessing(false);
    }
  }, [file, quality, resultPreview]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "compressed";
    downloadBlob(resultBlob, `${name}-compressed.jpg`);
  }, [resultBlob, file]);

  // Auto-compress when quality changes
  const handleQualityChange = useCallback(
    (val: number) => {
      setQuality(val);
    },
    []
  );

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت الصورة لضغطها"
        hint="سيتم التحويل إلى JPEG للضغط الأمثل"
      />
    );
  }

  const savings =
    resultBlob && file
      ? Math.round(((file.size - resultBlob.size) / file.size) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* صف المعاينة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-sm font-medium text-text-muted mb-3">الأصلية</p>
          <div className="aspect-video bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
            {preview && (
              <img src={preview} alt="الأصل" className="max-w-full max-h-full object-contain" />
            )}
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {file.name} — {formatFileSize(file.size)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-sm font-medium text-text-muted mb-3">بعد الضغط</p>
          <div className="aspect-video bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
            {resultPreview ? (
              <img src={resultPreview} alt="مضغوطة" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            )}
          </div>
          {resultBlob && (
            <p className="mt-2 text-sm text-text-secondary">
              الحجم: {formatFileSize(resultBlob.size)}
              {savings > 0 && (
                <span className="text-success font-medium mr-2">
                  (وفرت {savings}%)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* شريط الجودة */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text-secondary">
            جودة الضغط
          </label>
          <span className="text-sm font-bold text-primary tabular-nums">
            {quality}%
          </span>
        </div>

        <input
          type="range"
          min={10}
          max={100}
          value={quality}
          onChange={(e) => handleQualityChange(Number(e.target.value))}
          className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>حجم أصغر (10%)</span>
          <span>جودة أعلى (100%)</span>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleCompress}
            disabled={processing}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري الضغط...
              </span>
            ) : (
              "تطبيق الضغط"
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
              setResultPreview(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            رفع صورة جديدة
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
