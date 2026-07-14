"use client";

import { useState, useCallback } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  canvasToBlob,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";
import JSZip from "jszip";

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256];

interface GeneratedIcon {
  size: number;
  blob: Blob;
  url: string;
}

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (f: File) => {
      setError(null);
      setIcons([]);
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImage(file);
      const generated: GeneratedIcon[] = [];

      for (const size of FAVICON_SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;

        // Draw image centered, cover
        const scale = Math.max(size / img.width, size / img.height);
        const sw = size / scale;
        const sh = size / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

        const blob = await canvasToBlob(canvas, "image/png");
        const url = URL.createObjectURL(blob);
        generated.push({ size, blob, url });
      }

      setIcons(generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء توليد الأيقونات");
    } finally {
      setProcessing(false);
    }
  }, [file]);

  const handleDownloadZip = useCallback(async () => {
    if (icons.length === 0) return;
    const zip = new JSZip();
    icons.forEach((icon) => {
      zip.file(`favicon-${icon.size}x${icon.size}.png`, icon.blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, "favicons.zip");
  }, [icons]);

  const handleDownloadSingle = useCallback((icon: GeneratedIcon) => {
    downloadBlob(icon.blob, `favicon-${icon.size}x${icon.size}.png`);
  }, []);

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت الصورة لتوليد الأيقونات"
        hint="سيتم توليد 6 مقاسات من 16×16 إلى 256×256"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* الصورة المرفوعة */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <p className="text-sm font-medium text-text-muted mb-3">الصورة الأصلية</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            {preview && (
              <img src={preview} alt="الأصل" className="max-w-full max-h-full object-contain" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary font-medium">{file.name}</p>
            <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleGenerate}
                disabled={processing}
                className="rounded-lg bg-primary px-5 py-2 text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    جاري التوليد...
                  </span>
                ) : (
                  "توليد الأيقونات"
                )}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setIcons([]);
                  setError(null);
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-surface transition-colors"
              >
                إعادة
              </button>
            </div>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-danger">{error}</p>
        )}
      </div>

      {/* الأيقونات المولدة */}
      {icons.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-text-secondary">
              الأيقونات المولدة ({icons.length} مقاسات)
            </p>
            <button
              onClick={handleDownloadZip}
              className="rounded-lg bg-success px-5 py-2 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل الكل ZIP ⬇️
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {icons.map((icon) => (
              <div
                key={icon.size}
                className="rounded-lg border border-border bg-bg-surface p-3 text-center hover:shadow-card-hover transition-shadow cursor-pointer"
                onClick={() => handleDownloadSingle(icon)}
                title={`تحميل ${icon.size}×${icon.size}`}
              >
                <div
                  className="mx-auto bg-checkerboard rounded overflow-hidden"
                  style={{ width: icon.size, height: icon.size, maxWidth: "100%" }}
                >
                  <img
                    src={icon.url}
                    alt={`${icon.size}x${icon.size}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-text-secondary">
                  {icon.size}×{icon.size}
                </p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(icon.blob.size)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
