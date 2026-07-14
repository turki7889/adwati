"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import UploadArea from "./shared/upload-area";
import { loadImage, downloadBlob, formatFileSize } from "@/lib/image-utils";

export default function ExtractSignature() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(200);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // رسم الخلفية المتقلبة (checkerboard) لإظهار الشفافية
  const drawCheckerboard = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 12;
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        ctx.fillStyle =
          ((x / size + y / size) % 2 === 0) ? "#e5e5e5" : "#ffffff";
        ctx.fillRect(x, y, size, size);
      }
    }
  }, []);

  // معالجة البكسلات: تحويل الأبيض/الفاتح إلى شفاف
  const processImage = useCallback(() => {
    const img = imgRef.current;
    const srcCanvas = sourceCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!img || !srcCanvas || !previewCanvas) return;

    setProcessing(true);
    setError(null);

    try {
      // رسم الصورة على canvas المصدر
      const maxW = 1200;
      const maxH = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      srcCanvas.width = w;
      srcCanvas.height = h;
      const srcCtx = srcCanvas.getContext("2d")!;
      srcCtx.drawImage(img, 0, 0, w, h);

      // الحصول على بيانات البكسلات
      const imageData = srcCtx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // لكل بكسل: إذا كان السطوع > threshold، اجعل alpha = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // حساب السطوع (متوسط RGB)
        const brightness = (r + g + b) / 3;
        if (brightness > threshold) {
          data[i + 3] = 0; // شفاف
        }
      }

      // رسم النتيجة على preview canvas
      previewCanvas.width = w;
      previewCanvas.height = h;
      const previewCtx = previewCanvas.getContext("2d")!;

      // رسم الخلفية المتقلبة أولاً
      drawCheckerboard(previewCanvas);

      // إنشاء canvas مؤقت للنتيجة ثم رسمه فوق الخلفية
      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = w;
      resultCanvas.height = h;
      const resultCtx = resultCanvas.getContext("2d")!;
      resultCtx.putImageData(imageData, 0, 0);
      previewCtx.drawImage(resultCanvas, 0, 0);

      // حفظ النتيجة للتحميل
      resultCanvas.toBlob((blob) => {
        if (blob) {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultUrl(URL.createObjectURL(blob));
        }
      }, "image/png");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء معالجة التوقيع");
    } finally {
      setProcessing(false);
    }
  }, [threshold, resultUrl, drawCheckerboard]);

  // إعادة المعالجة عند تغيير threshold
  useEffect(() => {
    if (imgRef.current) {
      const timer = setTimeout(processImage, 100);
      return () => clearTimeout(timer);
    }
  }, [threshold, processImage]);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    setResultUrl(null);
    try {
      const img = await loadImage(f);
      imgRef.current = img;
      processImage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل الصورة");
    }
  }, [processImage]);

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return;
    // Convert data URL to blob for download
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    // Recreate clean transparent PNG (without checkerboard)
    const srcCanvas = sourceCanvasRef.current;
    if (!srcCanvas) return;

    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) return;

    const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > threshold) {
        data[i + 3] = 0;
      }
    }

    const cleanCanvas = document.createElement("canvas");
    cleanCanvas.width = srcCanvas.width;
    cleanCanvas.height = srcCanvas.height;
    const cleanCtx = cleanCanvas.getContext("2d")!;
    cleanCtx.putImageData(imageData, 0, 0);

    cleanCanvas.toBlob((blob) => {
      if (blob) {
        const name = file.name.replace(/\.[^.]+$/, "") || "signature";
        downloadBlob(blob, `${name}-transparent.png`);
      }
    }, "image/png");
  }, [resultUrl, file, threshold]);

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت صورة التوقيع هنا"
        hint="يفضل توقيع بقلم أسود على ورق أبيض"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* شريط التحكم */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-text-secondary">
            حساسية إزالة الخلفية
          </label>
          <span className="text-sm font-bold text-primary tabular-nums">
            {threshold}
          </span>
        </div>

        <input
          type="range"
          min={50}
          max={250}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex justify-between mt-2 text-xs text-text-muted">
          <span>إزالة أكثر (50)</span>
          <span>إزالة أقل (250)</span>
        </div>

        <div className="flex items-center gap-3 mt-5">
          {resultUrl && (
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل PNG شفاف ⬇️
            </button>
          )}

          <button
            onClick={() => {
              setFile(null);
              setResultUrl(null);
              imgRef.current = null;
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

      {/* معاينة حية مع خلفية متقلبة */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-text-muted">
            معاينة التوقيع (الشفاف يظهر بخلفية متقلبة)
          </p>
          {processing && (
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              جاري المعالجة...
            </span>
          )}
        </div>
        <div className="rounded-lg overflow-hidden border border-border bg-bg-surface flex items-center justify-center min-h-[300px]">
          <canvas
            ref={previewCanvasRef}
            className="max-w-full"
          />
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          {file.name} — {formatFileSize(file.size)}
        </p>
      </div>

      {/* Canvas مخفي للمعالجة */}
      <canvas ref={sourceCanvasRef} className="hidden" />
    </div>
  );
}
