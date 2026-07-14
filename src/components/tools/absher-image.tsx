"use client";

import { useState, useCallback, useEffect } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  canvasToBlob,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";

const TARGET_SIZE = 200;
const MAX_KB = 100;
const MAX_BYTES = MAX_KB * 1024;

export default function AbsherImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [finalSize, setFinalSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultBlob(null);
    setResultUrl(null);
    setFinalSize(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const image = await loadImage(f);
    setImg(image);
  }, []);

  // Auto-process when image loads
  useEffect(() => {
    if (!img) return;
    processImage(img);
  }, [img]);

  const processImage = async (image: HTMLImageElement) => {
    setProcessing(true);
    setError(null);
    setStatusMsg("جاري تغيير الحجم إلى 200×200...");

    try {
      // Step 1: Resize to 200x200 (cover crop if needed)
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext("2d")!;

      // Fill white background (for transparent images)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      // Draw image centered, cover
      const scale = Math.max(TARGET_SIZE / image.width, TARGET_SIZE / image.height);
      const sw = TARGET_SIZE / scale;
      const sh = TARGET_SIZE / scale;
      const sx = (image.width - sw) / 2;
      const sy = (image.height - sh) / 2;
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, TARGET_SIZE, TARGET_SIZE);

      // Step 2: Compress to <= 100KB
      setStatusMsg("جاري الضغط إلى أقل من 100 كيلوبايت...");
      let quality = 0.9;
      let blob: Blob;

      // Binary search for quality that fits within 100KB
      let low = 0.05;
      let high = 1.0;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 8; i++) {
        quality = (low + high) / 2;
        blob = await canvasToBlob(canvas, "image/jpeg", quality);

        if (blob.size <= MAX_BYTES) {
          bestBlob = blob;
          low = quality; // try higher quality
        } else {
          high = quality; // must go lower
        }
      }

      // If even lowest quality is too large, use it anyway
      if (!bestBlob) {
        bestBlob = await canvasToBlob(canvas, "image/jpeg", 0.05);
      }

      setResultBlob(bestBlob);
      setResultUrl(URL.createObjectURL(bestBlob));
      setFinalSize(bestBlob.size);
      setStatusMsg(null);

      if (bestBlob.size > MAX_BYTES) {
        setError(
          `تعذر الوصول لحجم أقل من ${MAX_KB}KB. الحجم النهائي: ${formatFileSize(bestBlob.size)}`
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء معالجة الصورة");
      setStatusMsg(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "absher-photo-200x200.jpg");
  }, [resultBlob]);

  if (!file) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-info/5 border border-info/20 p-4">
          <p className="text-sm text-info font-medium">
            🛂 هذه الأداة تعدل صورتك لمقاس منصة أبشر (200×200 بكسل، حجم ≤ 100KB)
          </p>
        </div>
        <UploadArea
          onFileSelect={handleFile}
          label="اسحب وأفلت الصورة هنا"
          hint="الصيغ المدعومة: JPG, PNG, WebP"
        />
      </div>
    );
  }

  const isPass = finalSize !== null && finalSize <= MAX_BYTES;

  return (
    <div className="space-y-6">
      {/* معلومات أبشر */}
      <div className="rounded-xl bg-bg-card border border-border p-5">
        <h2 className="text-lg font-bold text-text-main mb-2">
          تصغير صورة أبشر — وزارة الداخلية السعودية
        </h2>
        <p className="text-sm text-text-secondary">
          هذه الأداة تعدل صورتك لمقاس منصة أبشر (200×200 بكسل، حجم ≤ 100KB)
        </p>
      </div>

      {/* حالة المعالجة */}
      {processing && (
        <div className="rounded-xl bg-primary-bg border border-primary/20 p-6 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-3" />
          <p className="text-primary font-medium">{statusMsg || "جاري المعالجة..."}</p>
        </div>
      )}

      {/* صف المعاينة */}
      {!processing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* الأصلية */}
          <div className="rounded-xl border border-border bg-bg-card p-4">
            <p className="text-sm font-medium text-text-muted mb-3">الصورة الأصلية</p>
            <div className="aspect-square bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
              {preview && (
                <img src={preview} alt="الأصل" className="max-w-full max-h-full object-contain" />
              )}
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-text-secondary">{file.name}</p>
              <p className="text-xs text-text-muted">
                الحجم: {formatFileSize(file.size)}
                {img && (
                  <span>
                    {" "}
                    | الأبعاد: {img.width}×{img.height}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* النتيجة */}
          <div className="rounded-xl border-2 border-border bg-bg-card p-4">
            <p className="text-sm font-medium text-text-muted mb-3">
              نتيجة أبشر — 200×200 بكسل
            </p>
            <div className="aspect-square bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-primary/30">
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="أبشر"
                  className="w-[200px] h-[200px] object-cover"
                />
              ) : (
                <p className="text-text-muted text-sm">جاري المعالجة...</p>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {finalSize !== null && (
                <>
                  <p className="text-sm text-text-secondary">
                    الحجم: {formatFileSize(finalSize)}
                    {isPass ? (
                      <span className="text-success font-medium mr-2">✅ ضمن الحد</span>
                    ) : (
                      <span className="text-danger font-medium mr-2">
                        ⚠️ تجاوز {MAX_KB}KB
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted">الأبعاد: {TARGET_SIZE}×{TARGET_SIZE} بكسل</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* أزرار */}
      {!processing && (
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <div className="flex items-center gap-3">
            {resultBlob && (
              <button
                onClick={handleDownload}
                className="rounded-lg bg-success px-8 py-4 text-white text-lg font-bold hover:opacity-90 transition-opacity shadow-lg"
              >
                تحميل صورة أبشر ⬇️
              </button>
            )}

            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setImg(null);
                setResultBlob(null);
                setResultUrl(null);
                setFinalSize(null);
                setError(null);
              }}
              className="rounded-lg border border-border px-5 py-4 text-text-secondary hover:bg-bg-surface transition-colors"
            >
              رفع صورة جديدة
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-danger">{error}</p>
          )}
          {isPass && !error && (
            <p className="mt-3 text-sm text-success">
              ✅ الصورة جاهزة للاستخدام في منصة أبشر! الأبعاد 200×200 بكسل والحجم أقل من {MAX_KB}KB.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
