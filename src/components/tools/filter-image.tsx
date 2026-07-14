"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  applyFilters,
  canvasToBlob,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";

interface FilterValues {
  brightness: number; // 0-200, default 100
  contrast: number;   // 0-200, default 100
  saturation: number; // 0-200, default 100
  grayscale: number;  // 0-100
}

const DEFAULT_FILTERS: FilterValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
};

export default function FilterImage() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultBlob(null);
    setResultSize(null);
    setFile(f);
    setFilters(DEFAULT_FILTERS);
    const image = await loadImage(f);
    setImg(image);
  }, []);

  // Live preview - apply filters on every change
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const canvas = applyFilters(img, filters);
    // Scale canvas for display
    const displayCanvas = canvasRef.current;
    const maxW = 600;
    const scale = Math.min(maxW / canvas.width, 1);
    displayCanvas.width = canvas.width * scale;
    displayCanvas.height = canvas.height * scale;
    const ctx = displayCanvas.getContext("2d")!;
    ctx.drawImage(canvas, 0, 0, displayCanvas.width, displayCanvas.height);
  }, [img, filters]);

  const handleApply = useCallback(async () => {
    if (!img) return;
    setProcessing(true);
    setError(null);
    try {
      const canvas = applyFilters(img, filters);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      setResultBlob(blob);
      setResultSize(blob.size);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تطبيق الفلاتر");
    } finally {
      setProcessing(false);
    }
  }, [img, filters]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "filtered";
    downloadBlob(resultBlob, `${name}-filtered.jpg`);
  }, [resultBlob, file]);

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const updateFilter = (key: keyof FilterValues, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت الصورة لتطبيق الفلاتر"
        hint="اضبط قيم السطوع والتباين والتشبع والتدرج الرمادي"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* معاينة حية */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <p className="text-sm font-medium text-text-muted mb-3">معاينة حية</p>
        <div className="bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>
        {file && (
          <p className="mt-2 text-sm text-text-secondary">
            {file.name} — {formatFileSize(file.size)}
          </p>
        )}
      </div>

      {/* Sliders */}
      <div className="rounded-xl border border-border bg-bg-card p-6 space-y-5">
        {/* Brightness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">السطوع</label>
            <span className="text-sm font-bold text-primary">{filters.brightness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={filters.brightness}
            onChange={(e) => updateFilter("brightness", Number(e.target.value))}
            className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">التباين</label>
            <span className="text-sm font-bold text-primary">{filters.contrast}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={filters.contrast}
            onChange={(e) => updateFilter("contrast", Number(e.target.value))}
            className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">التشبع</label>
            <span className="text-sm font-bold text-primary">{filters.saturation}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={filters.saturation}
            onChange={(e) => updateFilter("saturation", Number(e.target.value))}
            className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Grayscale */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">تدرج رمادي</label>
            <span className="text-sm font-bold text-primary">{filters.grayscale}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.grayscale}
            onChange={(e) => updateFilter("grayscale", Number(e.target.value))}
            className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleApply}
            disabled={processing}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري التطبيق...
              </span>
            ) : (
              "تطبيق وتحميل"
            )}
          </button>

          {resultBlob && (
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل ⬇️
              {resultSize && (
                <span className="mr-1 text-white/80 text-xs">
                  ({formatFileSize(resultSize)})
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            إعادة تعيين
          </button>

          <button
            onClick={() => {
              setFile(null);
              setImg(null);
              setFilters(DEFAULT_FILTERS);
              setResultBlob(null);
              setResultSize(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            صورة جديدة
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
