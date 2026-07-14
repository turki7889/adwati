"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import UploadArea from "./shared/upload-area";
import { loadImage, downloadBlob, formatFileSize } from "@/lib/image-utils";
import { removeBackground, preload } from "@imgly/background-removal";

type Mode = "ai" | "manual";
type BgMode = "light" | "dark";

// ─── Module-level AI model cache (يحمل مرة واحدة لكل الجلسة) ───
let modelReady = false;
let modelLoadPromise: Promise<void> | null = null;
// مرجع خارجي لتحديث واجهة المستخدم أثناء تحميل النموذج
let _onModelProgress:
  | ((key: string, current: number, total: number) => void)
  | null = null;

async function ensureModelLoaded(
  onProgress: (key: string, current: number, total: number) => void
): Promise<void> {
  if (modelReady) return;
  _onModelProgress = onProgress;
  if (!modelLoadPromise) {
    modelLoadPromise = preload({
      model: "isnet_quint8",
      publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
      progress: (key, current, total) => {
        _onModelProgress?.(key, current, total);
      },
    }).then(() => {
      modelReady = true;
    });
  }
  return modelLoadPromise;
}

// ─── Progress Bar Component ───
function ProgressBar({
  current,
  total,
  message,
}: {
  current: number;
  total: number;
  message: string;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          {message}
        </span>
        <span className="text-sm font-bold text-primary tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="w-full h-3 bg-bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ExtractSignature() {
  const [file, setFile] = useState<File | null>(null);

  // ─── AI mode state ───
  const [aiPhase, setAiPhase] = useState<
    "idle" | "loading-model" | "processing" | "done" | "error"
  >("idle");
  const [aiProgress, setAiProgress] = useState({ current: 0, total: 0 });
  const [aiProgressMsg, setAiProgressMsg] = useState(
    "جاري تحميل نموذج الذكاء الاصطناعي..."
  );
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // ─── Manual mode state ───
  const [mode, setMode] = useState<Mode>("ai");
  const [threshold, setThreshold] = useState(200);
  const [feather, setFeather] = useState(20);
  const [bgMode, setBgMode] = useState<BgMode>("light");
  const [manualProcessing, setManualProcessing] = useState(false);

  // ─── Shared state ───
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // ─── Checkerboard drawing ───
  const drawCheckerboard = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = 12;
      for (let y = 0; y < canvas.height; y += size) {
        for (let x = 0; x < canvas.width; x += size) {
          ctx.fillStyle =
            (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0
              ? "#e5e5e5"
              : "#ffffff";
          ctx.fillRect(x, y, size, size);
        }
      }
    },
    []
  );

  // ─── Manual processing (pixel threshold + feather) ───
  const applyTransparency = useCallback(
    (data: Uint8ClampedArray) => {
      const f = feather;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (f === 0) {
          const shouldMakeTransparent =
            bgMode === "light"
              ? brightness > threshold
              : brightness < threshold;

          if (shouldMakeTransparent) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0;
          }
        } else {
          let alpha: number;

          if (bgMode === "light") {
            if (brightness <= threshold - f) {
              alpha = 255;
            } else if (brightness >= threshold + f) {
              alpha = 0;
            } else {
              alpha = Math.round(
                255 * (1 - (brightness - (threshold - f)) / (2 * f))
              );
            }
          } else {
            if (brightness >= threshold + f) {
              alpha = 255;
            } else if (brightness <= threshold - f) {
              alpha = 0;
            } else {
              alpha = Math.round(
                255 * ((brightness - (threshold - f)) / (2 * f))
              );
            }
          }

          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = alpha;
        }
      }
    },
    [threshold, feather, bgMode]
  );

  const processManual = useCallback(() => {
    const img = imgRef.current;
    const srcCanvas = sourceCanvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!img || !srcCanvas || !previewCanvas) return;

    setManualProcessing(true);
    setError(null);

    try {
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

      const imageData = srcCtx.getImageData(0, 0, w, h);
      const data = imageData.data;
      applyTransparency(data);

      previewCanvas.width = w;
      previewCanvas.height = h;
      const previewCtx = previewCanvas.getContext("2d")!;
      drawCheckerboard(previewCanvas);

      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = w;
      resultCanvas.height = h;
      const resultCtx = resultCanvas.getContext("2d")!;
      resultCtx.putImageData(imageData, 0, 0);
      previewCtx.drawImage(resultCanvas, 0, 0);

      resultCanvas.toBlob((blob) => {
        if (blob) {
          setResultBlob(blob);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, "image/png");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "حدث خطأ أثناء معالجة التوقيع"
      );
    } finally {
      setManualProcessing(false);
    }
  }, [drawCheckerboard, applyTransparency, previewUrl]);

  // ─── AI processing ───
  const processAI = useCallback(
    async (imageDataUrl: string) => {
      setAiPhase("loading-model");
      setError(null);
      setAiProgress({ current: 0, total: 0 });
      setAiProgressMsg("جاري تحميل نموذج الذكاء الاصطناعي...");

      try {
        // 1. تأكد من تحميل النموذج
        const modelProgressCb = (key: string, current: number, total: number) => {
          setAiProgress({ current, total });
          if (key === "fetch" || key === "download") {
            setAiProgressMsg("جاري تحميل نموذج الذكاء الاصطناعي...");
          } else {
            setAiProgressMsg("جاري تجهيز النموذج...");
          }
        };
        await ensureModelLoaded(modelProgressCb);

        // 2. معالجة الصورة
        setAiPhase("processing");
        setAiProgress({ current: 0, total: 0 });
        setAiProgressMsg("النموذج جاهز — جاري معالجة الصورة...");

        const result = await removeBackground(imageDataUrl, {
          model: "isnet_quint8",
          output: { format: "image/png" },
          publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
          progress: (key, current, total) => {
            setAiProgress({ current, total });
            if (key === "compute") {
              setAiProgressMsg("جاري معالجة الصورة...");
            }
          },
        });

        // 3. عرض النتيجة
        setResultBlob(result);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        // رسم النتيجة على preview canvas مع checkerboard
        const previewCanvas = previewCanvasRef.current;
        if (previewCanvas) {
          const resultUrl = URL.createObjectURL(result);
          setPreviewUrl(resultUrl);

          const img = await loadImageFromBlob(result);
          previewCanvas.width = img.width;
          previewCanvas.height = img.height;
          const ctx = previewCanvas.getContext("2d")!;
          drawCheckerboard(previewCanvas);
          ctx.drawImage(img, 0, 0);
        }

        setAiPhase("done");
      } catch (e) {
        setAiPhase("error");
        setError(
          e instanceof Error
            ? `فشل معالجة AI: ${e.message}`
            : "فشل تحميل نموذج الذكاء الاصطناعي أو معالجة الصورة"
        );
      }
    },
    [drawCheckerboard, previewUrl]
  );

  // ─── Re-run manual processing on slider changes ───
  useEffect(() => {
    if (mode === "manual" && imgRef.current) {
      const timer = setTimeout(processManual, 100);
      return () => clearTimeout(timer);
    }
  }, [threshold, feather, bgMode, mode, processManual]);

  // ─── File upload handler ───
  const handleFile = useCallback(
    async (f: File) => {
      setError(null);
      setFile(f);
      setResultBlob(null);
      setPreviewUrl(null);
      setAiPhase("idle");

      try {
        const img = await loadImage(f);
        imgRef.current = img;

        if (mode === "ai") {
          // Convert file to data URL for AI processing (Blob format can cause issues)
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
        setError(
          e instanceof Error ? e.message : "فشل تحميل الصورة"
        );
      }
    },
    [mode, processAI, processManual]
  );

  // ─── Mode toggle: re-process ───
  const handleModeChange = useCallback(
    (newMode: Mode) => {
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
    },
    [file, processAI, processManual]
  );

  // ─── Download ───
  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "signature";
    downloadBlob(resultBlob, `${name}-signature.png`);
  }, [resultBlob, file]);

  // ─── Reset ───
  const handleReset = useCallback(() => {
    setFile(null);
    setResultBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    imgRef.current = null;
    setError(null);
    setAiPhase("idle");
    setAiProgress({ current: 0, total: 0 });
  }, [previewUrl]);

  // ─── Empty state (no file uploaded) ───
  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت صورة التوقيع هنا"
        hint="يفضل توقيع بقلم أسود على ورق أبيض"
      />
    );
  }

  const isProcessing = mode === "ai"
    ? aiPhase === "loading-model" || aiPhase === "processing"
    : manualProcessing;

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ─── */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium text-text-secondary">
            وضع المعالجة
          </span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => handleModeChange("ai")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "ai"
                  ? "bg-primary text-white"
                  : "bg-bg-surface text-text-secondary hover:bg-bg-hover"
              }`}
            >
              🤖 ذكاء اصطناعي
            </button>
            <button
              onClick={() => handleModeChange("manual")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "manual"
                  ? "bg-primary text-white"
                  : "bg-bg-surface text-text-secondary hover:bg-bg-hover"
              }`}
            >
              ✋ يدوي
            </button>
          </div>
        </div>

        {/* AI Progress */}
        {mode === "ai" &&
          (aiPhase === "loading-model" || aiPhase === "processing") && (
            <div className="mb-5">
              <ProgressBar
                current={aiProgress.current}
                total={aiProgress.total}
                message={aiProgressMsg}
              />
            </div>
          )}

        {/* Manual controls */}
        {mode === "manual" && (
          <>
            {/* Background type toggle */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-text-secondary">
                نوع الخلفية المراد إزالتها
              </span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setBgMode("light")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    bgMode === "light"
                      ? "bg-primary text-white"
                      : "bg-bg-surface text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  فاتحة
                </button>
                <button
                  onClick={() => setBgMode("dark")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    bgMode === "dark"
                      ? "bg-primary text-white"
                      : "bg-bg-surface text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  داكنة
                </button>
              </div>
            </div>

            {/* Threshold slider */}
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
              <span>
                {bgMode === "light" ? "إزالة أكثر (50)" : "إزالة أكثر (250)"}
              </span>
              <span>
                {bgMode === "light" ? "إزالة أقل (250)" : "إزالة أقل (50)"}
              </span>
            </div>

            {/* Feather slider */}
            <div className="flex items-center justify-between mb-3 mt-5">
              <label className="text-sm font-medium text-text-secondary">
                تنعيم الحواف
              </label>
              <span className="text-sm font-bold text-primary tabular-nums">
                {feather}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>ثنائي (0)</span>
              <span>ناعم جداً (50)</span>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-5">
          {resultBlob && (
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل PNG شفاف ⬇️
            </button>
          )}

          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
          >
            رفع صورة جديدة
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        {/* Powered by AI badge */}
        {mode === "ai" && aiPhase === "done" && (
          <p className="mt-3 text-xs text-text-muted">
            🤖 مدعوم بتقنية الذكاء الاصطناعي — المعالجة محلية بالكامل
          </p>
        )}
      </div>

      {/* ─── Preview ─── */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-text-muted">
            معاينة التوقيع (الشفاف يظهر بخلفية متقلبة)
          </p>
          {isProcessing && (
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              جاري المعالجة...
            </span>
          )}
        </div>
        <div className="rounded-lg overflow-hidden border border-border bg-bg-surface flex items-center justify-center min-h-[300px]">
          <canvas ref={previewCanvasRef} className="max-w-full" />
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          {file.name} — {formatFileSize(file.size)}
        </p>
      </div>

      {/* Hidden source canvas */}
      <canvas ref={sourceCanvasRef} className="hidden" />
    </div>
  );
}

// ─── Helper: load image from blob ───
function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
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
