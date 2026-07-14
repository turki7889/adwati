"use client";

import { useState, useCallback } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import MultiUploadArea, { type MultiFile } from "./shared/multi-upload-area";
import { downloadBlob, formatFileSize } from "@/lib/image-utils";

type PageSizeKey = "A4" | "Letter";

const PAGE_SIZES: Record<PageSizeKey, { name: string; width: number; height: number }> = {
  A4: { name: "A4 (210×297 مم)", width: PageSizes.A4[0], height: PageSizes.A4[1] },
  Letter: { name: "Letter (216×279 مم)", width: PageSizes.Letter[0], height: PageSizes.Letter[1] },
};

export default function ImagesToPDF() {
  const [files, setFiles] = useState<MultiFile[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((multi: MultiFile[]) => {
    setError(null);
    setResultBlob(null);
    setFiles(multi);
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const imageToBytes = useCallback(
    (img: HTMLImageElement, format: string): Uint8Array | null => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);

      // For JPEG, use canvas; for PNG, use canvas with PNG output
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, 0.92);

      // Convert data URL to binary
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    },
    []
  );

  const handleConvert = useCallback(async () => {
    if (files.length === 0) {
      setError("يرجى رفع صورة واحدة على الأقل");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const doc = await PDFDocument.create();
      const { width: pageW, height: pageH } = PAGE_SIZES[pageSize];

      for (const mf of files) {
        // Load image
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          const url = URL.createObjectURL(mf.file);
          el.onload = () => {
            URL.revokeObjectURL(url);
            resolve(el);
          };
          el.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("فشل تحميل الصورة"));
          };
          el.src = url;
        });

        // Determine format: use original if it's PNG/JPEG, else convert to JPEG
        const isPng = mf.file.type === "image/png";
        const format = isPng ? "png" : "jpeg";
        const imgBytes = imageToBytes(img, format);
        if (!imgBytes) continue;

        // Embed image
        let embeddedImage;
        if (isPng) {
          embeddedImage = await doc.embedPng(imgBytes);
        } else {
          embeddedImage = await doc.embedJpg(imgBytes);
        }

        // Calculate dimensions to fit within page while maintaining aspect ratio
        const scale = Math.min(pageW / img.width, pageH / img.height);
        const imgW = img.width * scale;
        const imgH = img.height * scale;

        // Center on page
        const x = (pageW - imgW) / 2;
        const y = (pageH - imgH) / 2;

        const page = doc.addPage([pageW, pageH]);
        page.drawImage(embeddedImage, { x, y, width: imgW, height: imgH });
      }

      const pdfBytes = await doc.save();
      setResultBlob(new Blob([pdfBytes] as BlobPart[], { type: "application/pdf" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء التحويل");
    } finally {
      setProcessing(false);
    }
  }, [files, pageSize, imageToBytes]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "images.pdf");
  }, [resultBlob]);

  if (files.length === 0) {
    return (
      <MultiUploadArea
        onFilesSelect={handleFiles}
        accept="image/*"
        label="اسحب وأفلت الصور هنا"
        hint="يمكنك اختيار عدة صور — كل صورة ستصبح صفحة في PDF"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* قائمة الصور */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-main">
            الصور المختارة ({files.length})
          </h3>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {files.map((mf, index) => (
            <div
              key={mf.id}
              className="flex items-center gap-3 rounded-lg border border-border-light bg-bg-surface px-4 py-3"
            >
              <span className="text-sm font-bold text-text-muted w-8 text-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-main truncate">
                  🖼️ {mf.file.name}
                </p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(mf.file.size)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="rounded p-1.5 text-text-muted hover:bg-bg-main hover:text-text-main disabled:opacity-30 transition-colors"
                  title="تحريك للأعلى"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === files.length - 1}
                  className="rounded p-1.5 text-text-muted hover:bg-bg-main hover:text-text-main disabled:opacity-30 transition-colors"
                  title="تحريك للأسفل"
                >
                  ▼
                </button>
                <button
                  onClick={() => removeFile(mf.id)}
                  className="rounded p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors mr-2"
                  title="حذف"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* اختيار حجم الصفحة */}
        <div className="mt-5 flex items-center gap-3">
          <label className="text-sm font-medium text-text-secondary">
            حجم الصفحة:
          </label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PageSizeKey)}
            className="rounded-lg border border-border bg-bg-main px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {Object.entries(PAGE_SIZES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleConvert}
            disabled={processing || files.length === 0}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري التحويل...
              </span>
            ) : (
              "تحويل إلى PDF 🖼️→📄"
            )}
          </button>

          {resultBlob && (
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل images.pdf ⬇️
            </button>
          )}

          <button
            onClick={() => {
              setFiles([]);
              setResultBlob(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            رفع صور جديدة
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
