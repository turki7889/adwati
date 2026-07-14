"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import MultiUploadArea, { type MultiFile } from "./shared/multi-upload-area";
import { downloadBlob, formatFileSize } from "@/lib/image-utils";

export default function MergePDF() {
  const [files, setFiles] = useState<MultiFile[]>([]);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (multi: MultiFile[]) => {
    setError(null);
    setResultBlob(null);
    setFiles(multi);

    // Count pages for each file
    const counts: Record<string, number> = {};
    for (const mf of multi) {
      try {
        const buf = await mf.file.arrayBuffer();
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        counts[mf.id] = doc.getPageCount();
      } catch {
        counts[mf.id] = 0;
      }
    }
    setPageCounts(counts);
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
    setPageCounts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError("يرجى رفع ملفين PDF على الأقل للدمج");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const mergedDoc = await PDFDocument.create();

      for (const mf of files) {
        const buf = await mf.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await mergedDoc.copyPages(
          srcDoc,
          srcDoc.getPageIndices()
        );
        pages.forEach((p) => mergedDoc.addPage(p));
      }

      const pdfBytes = await mergedDoc.save();
      setResultBlob(new Blob([pdfBytes] as BlobPart[], { type: "application/pdf" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء الدمج");
    } finally {
      setProcessing(false);
    }
  }, [files]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "merged.pdf");
  }, [resultBlob]);

  if (files.length === 0) {
    return (
      <MultiUploadArea
        onFilesSelect={handleFiles}
        accept=".pdf"
        label="اسحب وأفلت ملفات PDF هنا"
        hint="يمكنك اختيار عدة ملفات PDF للدمج"
      />
    );
  }

  const totalPages = Object.values(pageCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* قائمة الملفات */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-main">
            الملفات المختارة ({files.length})
          </h3>
          <span className="text-sm text-text-muted">
            إجمالي الصفحات: {totalPages}
          </span>
        </div>

        <div className="space-y-2">
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
                  📄 {mf.file.name}
                </p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(mf.file.size)}
                  {pageCounts[mf.id] !== undefined && (
                    <span className="mr-3">
                      | {pageCounts[mf.id]} صفحة
                    </span>
                  )}
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

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleMerge}
            disabled={processing || files.length < 2}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري الدمج...
              </span>
            ) : (
              "دمج الملفات 🔗"
            )}
          </button>

          {resultBlob && (
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل merged.pdf ⬇️
            </button>
          )}

          <button
            onClick={() => {
              setFiles([]);
              setResultBlob(null);
              setPageCounts({});
              setError(null);
            }}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            رفع ملفات جديدة
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
