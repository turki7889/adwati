"use client";

import { useState, useCallback } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  drawImageToCanvas,
  canvasToBlob,
  canvasToDataURL,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";

export default function ResizeImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [percent, setPercent] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const originalAspect = img ? img.width / img.height : 1;

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultUrl(null);
    setResultBlob(null);
    setResultSize(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const image = await loadImage(f);
    setImg(image);
    setWidth(image.width);
    setHeight(image.height);
    setPercent(100);
  }, []);

  // Apply resize
  const handleResize = useCallback(async () => {
    if (!img) return;
    setProcessing(true);
    setError(null);
    try {
      let w: number, h: number;
      if (mode === "percent") {
        w = Math.round((img.width * percent) / 100);
        h = Math.round((img.height * percent) / 100);
      } else {
        w = width;
        h = height;
      }
      w = Math.max(1, Math.round(w));
      h = Math.max(1, Math.round(h));

      const canvas = drawImageToCanvas(img, w, h);
      const url = canvasToDataURL(canvas, "image/png");
      setResultUrl(url);

      const blob = await canvasToBlob(canvas, "image/png");
      setResultBlob(blob);
      setResultSize(blob.size);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تغيير الحجم");
    } finally {
      setProcessing(false);
    }
  }, [img, mode, width, height, percent]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "resized";
    downloadBlob(resultBlob, `${name}-resized.png`);
  }, [resultBlob, file]);

  // Lock aspect ratio: update height when width changes
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && img) {
      setHeight(Math.round(val / originalAspect));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && img) {
      setWidth(Math.round(val * originalAspect));
    }
  };

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت الصورة لتغيير أبعادها"
        hint="يمكنك تحديد الأبعاد بالبكسل أو النسبة المئوية"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* معاينة قبل وبعد */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-sm font-medium text-text-muted mb-3">
            الأصلية ({img?.width} × {img?.height})
          </p>
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
          <p className="text-sm font-medium text-text-muted mb-3">
            بعد تغيير الحجم
            {resultUrl && img && (
              <span className="text-text-secondary">
                {" "}
                ({Math.round((width / img.width) * 100)}% من الأصلي)
              </span>
            )}
          </p>
          <div className="aspect-video bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
            {resultUrl ? (
              <img src={resultUrl} alt="النتيجة" className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-text-muted text-sm">اضغط &quot;تطبيق&quot; للمعاينة</p>
            )}
          </div>
          {resultSize !== null && (
            <p className="mt-2 text-sm text-text-secondary">
              الحجم: {formatFileSize(resultSize)}
            </p>
          )}
        </div>
      </div>

      {/* أدوات التحكم */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setMode("pixels")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "pixels"
                ? "bg-primary text-white"
                : "bg-bg-surface text-text-secondary hover:bg-border"
            }`}
          >
            بكسل
          </button>
          <button
            onClick={() => setMode("percent")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "percent"
                ? "bg-primary text-white"
                : "bg-bg-surface text-text-secondary hover:bg-border"
            }`}
          >
            نسبة مئوية
          </button>
        </div>

        {mode === "pixels" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                العرض (بكسل)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                min={1}
                className="w-full rounded-lg border border-border bg-bg-main px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                الارتفاع (بكسل)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                min={1}
                className="w-full rounded-lg border border-border bg-bg-main px-4 py-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              النسبة المئوية
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={200}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="flex-1 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm font-bold text-primary w-12 text-center">
                {percent}%
              </span>
            </div>
          </div>
        )}

        {/* Lock aspect ratio */}
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={lockAspect}
            onChange={(e) => setLockAspect(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-text-secondary">الحفاظ على التناسب</span>
        </label>

        {/* أزرار */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleResize}
            disabled={processing}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري تغيير الحجم...
              </span>
            ) : (
              "تطبيق"
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
              setImg(null);
              setResultUrl(null);
              setResultBlob(null);
              setResultSize(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            إعادة
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
