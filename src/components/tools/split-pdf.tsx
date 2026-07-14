"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import UploadArea from "./shared/upload-area";
import { downloadBlob, formatFileSize } from "@/lib/image-utils";

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultBlob(null);
    setRangeInput("");
    setFile(f);

    try {
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setTotalPages(count);
      setRangeInput(`1-${count}`);
    } catch {
      setError("تعذر قراءة ملف PDF. تأكد من أنه ملف صالح.");
      setTotalPages(0);
    }
  }, []);

  const parseRange = useCallback(
    (input: string): number[] => {
      const trimmed = input.replace(/\s/g, "");
      if (!trimmed) return [];

      // Handle comma-separated ranges like "1-3,5,7-9"
      const parts = trimmed.split(",");
      const pages: number[] = [];

      for (const part of parts) {
        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-");
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
            return [];
          }
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }
        } else {
          const p = parseInt(part, 10);
          if (isNaN(p) || p < 1 || p > totalPages) return [];
          pages.push(p);
        }
      }

      return Array.from(new Set(pages)).sort((a, b) => a - b);
    },
    [totalPages]
  );

  const handleSplit = useCallback(async () => {
    if (!file) return;

    const pages = parseRange(rangeInput);
    if (pages.length === 0) {
      setError(
        `صيغة النطاق غير صحيحة. مثال: "2-5" أو "1,3,5-7" (الصفحات من 1 إلى ${totalPages})`
      );
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      // pdf-lib 0-based indices
      const indices = pages.map((p) => p - 1);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      setResultBlob(new Blob([pdfBytes] as BlobPart[], { type: "application/pdf" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء التقسيم");
    } finally {
      setProcessing(false);
    }
  }, [file, rangeInput, parseRange, totalPages]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, "split.pdf");
  }, [resultBlob]);

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        accept=".pdf"
        label="اسحب وأفلت ملف PDF هنا"
        hint="سيتم عرض عدد الصفحات لتحديد النطاق"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* معلومات الملف */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-main truncate">
              📄 {file.name}
            </p>
            <p className="text-xs text-text-muted">
              {formatFileSize(file.size)}
              <span className="mr-3">| {totalPages} صفحة</span>
            </p>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setResultBlob(null);
              setError(null);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-surface transition-colors"
          >
            تغيير الملف
          </button>
        </div>
      </div>

      {/* إدخال النطاق */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          حدد نطاق الصفحات المراد استخراجها
        </label>
        <p className="text-xs text-text-muted mb-3">
          مثال: &quot;2-5&quot; لاستخراج الصفحات من 2 إلى 5، أو &quot;1,3,5-7&quot; لصفحات متفرقة
        </p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={rangeInput}
            onChange={(e) => {
              setRangeInput(e.target.value);
              setError(null);
            }}
            placeholder={`مثال: 1-${totalPages}`}
            className="flex-1 rounded-lg border border-border bg-bg-main px-4 py-3 text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            dir="ltr"
          />
          <button
            onClick={handleSplit}
            disabled={processing || !rangeInput.trim()}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري التقسيم...
              </span>
            ) : (
              "تقسيم ✂️"
            )}
          </button>
        </div>

        {resultBlob && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل split.pdf ⬇️
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
