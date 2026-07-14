"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import UploadArea from "./shared/upload-area";
import { loadImage, downloadBlob, formatFileSize } from "@/lib/image-utils";

type Mode = "ai" | "manual";
type BgMode = "light" | "dark";

// ─── Module-level AI model cache ───
let segmenterPromise: Promise<any> | null = null;

async function ensureModelLoaded(
  onProgress: (msg: string) => void
): Promise<any> {
  if (!segmenterPromise) {
    onProgress("جاري تحميل نموذج الذكاء الاصطناعي (~45MB، مرة واحدة فقط)...");
    segmenterPromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("background-removal", "briaai/RMBG-1.4", {
        progress_callback: (info: any) => {
          if (info?.status === "progress") {
            const pct = info?.progress ? Math.round(info.progress) : 0;
            onProgress(`جاري تحميل النموذج... ${pct}%`);
          } else if (info?.status === "done") {
            onProgress("اكتمل تحميل النموذج — جاري التجهيز...");
          }
        },
      });
    })().catch((e: any) => {
      segmenterPromise = null;
      throw e;
    });
  }
  return segmenterPromise;
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("فشل تحميل الصورة الناتجة"));
    };
    img.src = url;
  });
}

// ─── Progress Bar ───
function ProgressBar({ message }: { message: string }) {
  return (
    <div className="space-y-3">
      <div className="w-full h-3 bg-bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
      </div>
      <p className="text-sm text-text-secondary text-center">{message}</p>
    </div>
  );
}

export default function ExtractSignature() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("ai");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // AI state
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "processing" | "done">("idle");
  const [aiMessage, setAiMessage] = useState("");

  // Manual state
  const [threshold, setThreshold] = useState(200);
  const [feather, setFeather] = useState(20);
  const [bgMode, setBgMode] = useState<BgMode>("light");

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const drawCheckerboard = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 12;
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? "#e5e5e5" : "#ffffff";
        ctx.fillRect(x, y, size, size);
      }
    }
  }, []);

  // ─── Manual processing ───
  const applyTransparency = useCallback((data: Uint8ClampedArray) => {
    const f = feather;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      let alpha: number;
      if (f === 0) {
        const remove = bgMode === "light" ? brightness > threshold : brightness < threshold;
        alpha = remove ? 0 : 255;
      } else {
        if (bgMode === "light") {
          if (brightness <= threshold - f) alpha = 255;
          else if (brightness >= threshold + f) alpha = 0;
          else alpha = Math.round(255 * (1 - (brightness - (threshold - f)) / (2 * f)));
        } else {
          if (brightness >= threshold + f) alpha = 255;
          else if (brightness <= threshold - f) alpha = 0;
          else alpha = Math.round(255 * ((brightness - (threshold - f)) / (2 * f)));
        }
      }
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = alpha;
    }
  }, [threshold, feather, bgMode]);

  const processManual = useCallback(() => {
    const img = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!img || !previewCanvas) return;

    setError(null);
    try {
      const maxW = 1200, maxH = 1200;
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = w;
      srcCanvas.height = h;
      const srcCtx = srcCanvas.getContext("2d")!;
      srcCtx.drawImage(img, 0, 0, w, h);

      const imageData = srcCtx.getImageData(0, 0, w, h);
      applyTransparency(imageData.data);

      previewCanvas.width = w;
      previewCanvas.height = h;
      const previewCtx = previewCanvas.getContext("2d")!;
      drawCheckerboard(previewCanvas);

      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = w;
      resultCanvas.height = h;
      resultCanvas.getContext("2d")!.putImageData(imageData, 0, 0);
      previewCtx.drawImage(resultCanvas, 0, 0);

      resultCanvas.toBlob((blob) => {
        if (blob) {
          setResultBlob(blob);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, "image/png");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء معالجة التوقيع");
    }
  }, [drawCheckerboard, applyTransparency, previewUrl]);

  // ─── AI processing ───
  const processAI = useCallback(async (imageDataUrl: string) => {
    setAiStatus("loading");
    setAiMessage("");
    setError(null);

    try {
      const segmenter = await ensureModelLoaded(setAiMessage);
      
      setAiStatus("processing");
      setAiMessage("جاري معالجة الصورة...");
      
      const { RawImage } = await import("@xenova/transformers");
      const rawImage = await RawImage.fromURL(imageDataUrl);
      const output: RawImage = await segmenter(rawImage);

      // Convert RawImage to canvas with checkerboard
      const canvas = document.createElement("canvas");
      canvas.width = output.width;
      canvas.height = output.height;
      const ctx = canvas.getContext("2d")!;
      
      // Draw checkerboard
      const size = 12;
      for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
          ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? "#e5e5e5" : "#ffffff";
          ctx.fillRect(x, y, size, size);
        }
      }
      
      // Use the output's built-in toCanvas method
      const resultCanvas = output.toCanvas();
      ctx.drawImage(resultCanvas, 0, 0);

      // Update preview
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        const pctx = previewCanvas.getContext("2d")!;
        pctx.drawImage(canvas, 0, 0);
      }

      // Create blob for download
      const blob = await new Promise<Blob>((resolve) => {
        resultCanvas.toBlob((b) => resolve(b!), "image/png");
      });
      setResultBlob(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setAiStatus("done");
    } catch (e) {
      setError(e instanceof Error ? `فشل معالجة AI: ${e.message}` : "فشل معالجة AI");
      setAiStatus("idle");
    }
  }, [previewUrl]);

  // Re-run manual on slider change
  useEffect(() => {
    if (mode === "manual" && imgRef.current) {
      const timer = setTimeout(processManual, 100);
      return () => clearTimeout(timer);
    }
  }, [threshold, feather, bgMode, mode, processManual]);

  // ─── File upload ───
  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    setResultBlob(null);
    setPreviewUrl(null);
    setAiStatus("idle");

    try {
      const img = await loadImage(f);
      imgRef.current = img;

      if (mode === "ai") {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        await processAI(dataUrl);
      } else {
        processManual();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل الصورة");
    }
  }, [mode, processAI, processManual]);

  // ─── Mode toggle ───
  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode);
    if (imgRef.current && file) {
      if (newMode === "ai") {
        (async () => {
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          processAI(dataUrl);
        })();
      } else {
        processManual();
      }
    }
  }, [file, processAI, processManual]);

  // ─── Download ───
  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "signature";
    downloadBlob(resultBlob, `${name}-signature.png`);
  }, [resultBlob, file]);

  // ─── Empty state ───
  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت صورة التوقيع هنا"
        hint="يفضل توقيع بقلم أسود على ورق أبيض"
      />
    );
  }

  const isProcessing = mode === "ai" ? (aiStatus === "loading" || aiStatus === "processing") : false;

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ─── */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium text-text-secondary">وضع المعالجة</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => handleModeChange("ai")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "ai" ? "bg-primary text-white" : "bg-bg-surface text-text-secondary"}`}
            >
              🤖 ذكاء اصطناعي
            </button>
            <button
              onClick={() => handleModeChange("manual")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "manual" ? "bg-primary text-white" : "bg-bg-surface text-text-secondary"}`}
            >
              ✋ يدوي
            </button>
          </div>
        </div>

        {/* AI Progress */}
        {mode === "ai" && (aiStatus === "loading" || aiStatus === "processing") && (
          <div className="mb-5">
            <ProgressBar message={aiMessage} />
          </div>
        )}

        {/* AI Success */}
        {mode === "ai" && aiStatus === "done" && (
          <p className="text-sm text-success text-center mb-4">
            مدعوم بتقنية الذكاء الاصطناعي — المعالجة محلية بالكامل
          </p>
        )}

        {/* Manual controls */}
        {mode === "manual" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-text-secondary">نوع الخلفية</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button onClick={() => setBgMode("light")} className={`px-4 py-2 text-sm font-medium transition-colors ${bgMode === "light" ? "bg-primary text-white" : "bg-bg-surface text-text-secondary"}`}>فاتحة</button>
                <button onClick={() => setBgMode("dark")} className={`px-4 py-2 text-sm font-medium transition-colors ${bgMode === "dark" ? "bg-primary text-white" : "bg-bg-surface text-text-secondary"}`}>داكنة</button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-secondary">حساسية إزالة الخلفية</label>
              <span className="text-sm font-bold text-primary">{threshold}</span>
            </div>
            <input type="range" min={50} max={250} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full h-2 bg-bg-surface rounded-lg accent-primary" />
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>{bgMode === "light" ? "إزالة أكثر (50)" : "إزالة أكثر (250)"}</span>
              <span>{bgMode === "light" ? "إزالة أقل (250)" : "إزالة أقل (50)"}</span>
            </div>

            <div className="flex items-center justify-between mb-3 mt-5">
              <label className="text-sm font-medium text-text-secondary">تنعيم الحواف</label>
              <span className="text-sm font-bold text-primary">{feather}</span>
            </div>
            <input type="range" min={0} max={50} value={feather} onChange={(e) => setFeather(Number(e.target.value))} className="w-full h-2 bg-bg-surface rounded-lg accent-primary" />
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>ثنائي (0)</span>
              <span>ناعم جداً (50)</span>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-danger/10 border border-danger/20 text-danger p-3 text-sm">{error}</div>
        )}
      </div>

      {/* ─── Preview ─── */}
      <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">معاينة</span>
          <span className="text-xs text-text-muted">{file.name} · {formatFileSize(file.size)}</span>
        </div>
        <div className="flex items-center justify-center p-4 min-h-[300px]">
          <canvas ref={previewCanvasRef} className="max-w-full max-h-[500px] object-contain" />
        </div>
      </div>

      {/* ─── Actions ─── */}
      <div className="flex gap-3">
        <button onClick={handleFile.bind(null, file!)} className="flex-1 rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors">
          📁 رفع صورة جديدة
        </button>
        <button
          onClick={handleDownload}
          disabled={!resultBlob || isProcessing}
          className="flex-1 rounded-xl bg-success hover:bg-success/90 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white transition-colors"
        >
          ⬇️ تحميل PNG شفاف
        </button>
      </div>
    </div>
  );
}
