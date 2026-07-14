"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import UploadArea from "./shared/upload-area";
import { loadImage, downloadBlob, formatFileSize } from "@/lib/image-utils";

type Mode = "smart" | "manual";
type BgMode = "light" | "dark";
type PreviewBg = "checkerboard" | "white" | "black";

// ═══════════════════════════════════════════════════════
// خوارزميات Canvas API — معالجة احترافية بحتة
// ═══════════════════════════════════════════════════════

/**
 * Otsu's method — العتبة المثالية لفصل مقدمة/خلفية.
 * المدخل: histogram[256] من قيم السطوع
 * المخرج: قيمة العتبة المثلى (0–255)
 */
function otsuThreshold(histogram: number[]): number {
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0) return 128;

  let sumB = 0;
  let wB = 0;
  let maximum = 0;
  const sum1 = histogram.reduce((a, n, i) => a + i * n, 0);
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum1 - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maximum) {
      maximum = between;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * مسح 8 مناطق محيطية (4 زوايا + 4 حواف) لتحديد خصائص الخلفية.
 * تعيد: متوسط السطوع، نوع الخلفية (فاتحة/داكنة)، و histogram العيّنات.
 */
function sampleBorders(
  imageData: ImageData,
  sampleSize: number = 15
): { avgBrightness: number; isLight: boolean; histogram: number[] } {
  const { data, width, height } = imageData;
  const histogram = new Array<number>(256).fill(0);
  const samples: number[] = [];

  // 8 regions: 4 corners + 4 edge centers
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  const regions: [number, number, number, number][] = [
    [0, 0, sampleSize, sampleSize],                                     // ↖ top-left
    [width - sampleSize, 0, sampleSize, sampleSize],                    // ↗ top-right
    [0, height - sampleSize, sampleSize, sampleSize],                   // ↙ bottom-left
    [width - sampleSize, height - sampleSize, sampleSize, sampleSize],  // ↘ bottom-right
    [halfW - sampleSize, 0, sampleSize * 2, sampleSize],               // ↑ top edge
    [halfW - sampleSize, height - sampleSize, sampleSize * 2, sampleSize], // ↓ bottom edge
    [0, halfH - sampleSize, sampleSize, sampleSize * 2],               // ← left edge
    [width - sampleSize, halfH - sampleSize, sampleSize, sampleSize * 2], // → right edge
  ];

  for (const [rx, ry, rw, rh] of regions) {
    const sx = Math.max(0, rx);
    const sy = Math.max(0, ry);
    const ex = Math.min(width, sx + rw);
    const ey = Math.min(height, sy + rh);
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const i = (y * width + x) * 4;
        const brightness = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
        samples.push(brightness);
        histogram[brightness]++;
      }
    }
  }

  if (samples.length === 0) return { avgBrightness: 128, isLight: true, histogram };

  const sum = samples.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / samples.length);
  return { avgBrightness: avg, isLight: avg > 128, histogram };
}

/**
 * بناء histogram من الصورة كاملةً (مع sampling كل step بكسل للأداء).
 */
function buildHistogram(imageData: ImageData, step: number = 2): number[] {
  const { data, width, height } = imageData;
  const histogram = new Array<number>(256).fill(0);
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const brightness = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      histogram[brightness]++;
    }
  }
  return histogram;
}

/**
 * تقدير لون الخلفية الفعلي من 4 زوايا الصورة.
 * يُستخدم لاحقاً في decontamination.
 */
function estimateBgColor(
  imageData: ImageData,
  sampleSize: number = 15
): [number, number, number] {
  const { data, width, height } = imageData;
  let rSum = 0,
    gSum = 0,
    bSum = 0,
    count = 0;

  const corners: [number, number, number, number][] = [
    [0, 0, sampleSize, sampleSize],
    [width - sampleSize, 0, sampleSize, sampleSize],
    [0, height - sampleSize, sampleSize, sampleSize],
    [width - sampleSize, height - sampleSize, sampleSize, sampleSize],
  ];

  for (const [rx, ry, rw, rh] of corners) {
    const sx = Math.max(0, rx);
    const sy = Math.max(0, ry);
    const ex = Math.min(width, sx + rw);
    const ey = Math.min(height, sy + rh);
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const i = (y * width + x) * 4;
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
        count++;
      }
    }
  }

  if (count === 0) return [255, 255, 255];
  return [
    Math.round(rSum / count),
    Math.round(gSum / count),
    Math.round(bSum / count),
  ];
}

/**
 * Gaussian blur 3×3 على قناة alpha فقط.
 * ينتج حواف أنعم بكثير من feather الخطي.
 */
function gaussianBlurAlpha(
  src: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kSum = 16;
  const dst = new Uint8ClampedArray(src.length);

  // نسخ RGB مباشرة
  for (let i = 0; i < src.length; i += 4) {
    dst[i] = src[i];
    dst[i + 1] = src[i + 1];
    dst[i + 2] = src[i + 2];
  }

  // تمويه قناة alpha فقط
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let ki = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          sum += src[idx + 3] * kernel[ki++];
        }
      }
      const idx = (y * width + x) * 4;
      dst[idx + 3] = Math.round(sum / kSum);
    }
  }

  return dst;
}

/**
 * إزالة تلوث اللون — طرح لون الخلفية من البكسلات شبه الشفافة.
 * يمنع ظهور هالة بيضاء/سوداء حول التوقيع عند تركيبه على خلفيات مختلفة.
 *
 * الصيغة: foreground = (observed - background × (1−alpha)) / alpha
 */
function decontaminate(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bgColor: [number, number, number]
): void {
  const [bgR, bgG, bgB] = bgColor;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a === 0 || a === 255) continue;

      const alpha = a / 255;
      const newR = Math.round(
        Math.max(0, Math.min(255, (data[i] - bgR * (1 - alpha)) / alpha))
      );
      const newG = Math.round(
        Math.max(0, Math.min(255, (data[i + 1] - bgG * (1 - alpha)) / alpha))
      );
      const newB = Math.round(
        Math.max(0, Math.min(255, (data[i + 2] - bgB * (1 - alpha)) / alpha))
      );

      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }
  }
}

/**
 * البحث عن bounding box للمحتوى غير الشفاف (القص التلقائي).
 */
function findContentBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { left: number; top: number; right: number; bottom: number } | null {
  let left = width,
    top = height,
    right = 0,
    bottom = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        found = true;
      }
    }
  }

  return found ? { left, top, right, bottom } : null;
}

// ═══════════════════════════════════════════════════════
// رسوميات مساعدة
// ═══════════════════════════════════════════════════════

/** رسم خلفية رقعة الشطرنج */
function fillCheckerboard(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  size: number = 12
) {
  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      ctx.fillStyle =
        (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0
          ? "#e5e5e5"
          : "#ffffff";
      ctx.fillRect(x, y, size, size);
    }
  }
}

// ═══════════════════════════════════════════════════════
// Progress Bar
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// المكوّن الرئيسي
// ═══════════════════════════════════════════════════════

export default function ExtractSignature() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("smart");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Smart state
  const [smartStatus, setSmartStatus] = useState<
    "idle" | "processing" | "done"
  >("idle");
  const [smartMessage, setSmartMessage] = useState("");
  const [detectedBg, setDetectedBg] = useState<BgMode | null>(null);
  const [detectedThreshold, setDetectedThreshold] = useState<number | null>(
    null
  );
  const [previewBg, setPreviewBg] = useState<PreviewBg>("checkerboard");

  // Manual state
  const [threshold, setThreshold] = useState(200);
  const [feather, setFeather] = useState(20);
  const [bgMode, setBgMode] = useState<BgMode>("light");

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // نخزّن blob الصورة المعالجة (للخلفية الشفافة) لنعيد رسمها عند تغيير previewBg
  const resultBlobRef = useRef<Blob | null>(null);

  // ─── رسم المعاينة ───
  const drawPreview = useCallback(
    (canvas: HTMLCanvasElement | null, w: number, h: number) => {
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      switch (previewBg) {
        case "checkerboard":
          fillCheckerboard(ctx, w, h);
          break;
        case "white":
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          break;
        case "black":
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, w, h);
          break;
      }
    },
    [previewBg]
  );

  // إعادة رسم النتيجة عند تغيير خلفية المعاينة
  useEffect(() => {
    if (!resultBlobRef.current) return;
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    const img = new Image();
    const url = URL.createObjectURL(resultBlobRef.current);
    img.onload = () => {
      URL.revokeObjectURL(url);
      drawPreview(previewCanvas, img.width, img.height);
      const ctx = previewCanvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }, [previewBg, drawPreview]);

  // ════════════════════════════════════════════
  // المعالجة الذكية
  // ════════════════════════════════════════════
  const processSmart = useCallback(async () => {
    const img = imgRef.current;
    if (!img) return;

    setSmartStatus("processing");
    setSmartMessage("جاري تحليل الصورة...");
    setError(null);

    try {
      // تغيير الحجم إلى حد أقصى مقبول
      const maxW = 1600,
        maxH = 1600;
      let w = img.width,
        h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      // الرسم على Canvas
      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = w;
      srcCanvas.height = h;
      const srcCtx = srcCanvas.getContext("2d")!;
      srcCtx.drawImage(img, 0, 0, w, h);
      const imageData = srcCtx.getImageData(0, 0, w, h);

      // ① Auto-detect: تحليل 8 مناطق محيطية
      setSmartMessage("① جاري تحليل الخلفية (4 زوايا + 4 حواف)...");
      const { isLight } = sampleBorders(imageData);
      const autoBg: BgMode = isLight ? "light" : "dark";
      setDetectedBg(autoBg);

      // ② Otsu's threshold
      setSmartMessage("② جاري حساب العتبة المثالية (Otsu)...");
      const fullHistogram = buildHistogram(imageData, 2);
      const autoThreshold = otsuThreshold(fullHistogram);
      setDetectedThreshold(autoThreshold);

      // ③ تقدير لون الخلفية (لـ decontamination لاحقاً)
      const bgColor = estimateBgColor(imageData);

      // ④ إنشاء alpha mask مع الحفاظ على RGB الأصلي
      setSmartMessage("③ جاري إنشاء قناع الشفافية...");
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const isBg =
          autoBg === "light"
            ? brightness > autoThreshold
            : brightness < autoThreshold;
        data[i + 3] = isBg ? 0 : 255;
        // نحافظ على RGB الأصلي — لا نمسحه!
      }

      // ⑤ Gaussian blur 3×3 على alpha
      setSmartMessage("④ جاري تنعيم الحواف (Gaussian blur 3×3)...");
      const blurredData = gaussianBlurAlpha(data, w, h);

      // ⑥ Color decontamination
      setSmartMessage("⑤ جاري إزالة تلوث الألوان...");
      decontaminate(blurredData, w, h, bgColor);

      // ⑦ Auto-crop
      setSmartMessage("⑥ جاري القص التلقائي...");
      const bounds = findContentBounds(blurredData, w, h);

      let cropW = w,
        cropH = h,
        cropX = 0,
        cropY = 0;
      if (bounds) {
        const margin = 10;
        cropX = Math.max(0, bounds.left - margin);
        cropY = Math.max(0, bounds.top - margin);
        cropW = Math.min(
          w - cropX,
          bounds.right - bounds.left + margin * 2 + 1
        );
        cropH = Math.min(
          h - cropY,
          bounds.bottom - bounds.top + margin * 2 + 1
        );
      }

      // إنشاء الـ Blob الناتج
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d")!;
      const finalImageData = tempCtx.createImageData(w, h);
      finalImageData.data.set(blurredData);
      tempCtx.putImageData(finalImageData, 0, 0);

      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = cropW;
      resultCanvas.height = cropH;
      const resultCtx = resultCanvas.getContext("2d")!;
      resultCtx.drawImage(
        tempCanvas,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        cropW,
        cropH
      );

      const blob = await new Promise<Blob>((resolve) => {
        resultCanvas.toBlob((b) => resolve(b!), "image/png");
      });
      setResultBlob(blob);
      resultBlobRef.current = blob;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));

      // رسم المعاينة
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        drawPreview(previewCanvas, cropW, cropH);
        const previewCtx = previewCanvas.getContext("2d")!;
        previewCtx.drawImage(resultCanvas, 0, 0);
      }

      setSmartStatus("done");
      setSmartMessage("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "حدث خطأ أثناء المعالجة الذكية"
      );
      setSmartStatus("idle");
    }
  }, [drawPreview, previewUrl]);

  // ════════════════════════════════════════════
  // المعالجة اليدوية
  // ════════════════════════════════════════════
  const processManual = useCallback(() => {
    const img = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!img || !previewCanvas) return;

    setError(null);
    try {
      const maxW = 1200,
        maxH = 1200;
      let w = img.width,
        h = img.height;
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
      const { data } = imageData;

      // إنشاء alpha mask — توقيع أسود نقي
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        let alpha: number;

        if (feather === 0) {
          const remove =
            bgMode === "light"
              ? brightness > threshold
              : brightness < threshold;
          alpha = remove ? 0 : 255;
        } else {
          if (bgMode === "light") {
            if (brightness <= threshold - feather) alpha = 255;
            else if (brightness >= threshold + feather) alpha = 0;
            else
              alpha = Math.round(
                255 * (1 - (brightness - (threshold - feather)) / (2 * feather))
              );
          } else {
            if (brightness >= threshold + feather) alpha = 255;
            else if (brightness <= threshold - feather) alpha = 0;
            else
              alpha = Math.round(
                255 *
                  ((brightness - (threshold - feather)) / (2 * feather))
              );
          }
        }

        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = alpha;
      }

      // رسم المعاينة
      previewCanvas.width = w;
      previewCanvas.height = h;
      const previewCtx = previewCanvas.getContext("2d")!;
      drawPreview(previewCanvas, w, h);

      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = w;
      resultCanvas.height = h;
      resultCanvas.getContext("2d")!.putImageData(imageData, 0, 0);
      previewCtx.drawImage(resultCanvas, 0, 0);

      resultCanvas.toBlob((blob) => {
        if (blob) {
          setResultBlob(blob);
          resultBlobRef.current = blob;
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, "image/png");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "حدث خطأ أثناء معالجة التوقيع"
      );
    }
  }, [threshold, feather, bgMode, drawPreview, previewUrl]);

  // إعادة تشغيل المعالجة اليدوية عند تغيير الإعدادات
  useEffect(() => {
    if (mode === "manual" && imgRef.current) {
      const timer = setTimeout(processManual, 100);
      return () => clearTimeout(timer);
    }
  }, [threshold, feather, bgMode, mode, processManual]);

  // ════════════════════════════════════════════
  // رفع الملف
  // ════════════════════════════════════════════
  const handleFile = useCallback(
    async (f: File) => {
      setError(null);
      setFile(f);
      setResultBlob(null);
      setPreviewUrl(null);
      resultBlobRef.current = null;
      setSmartStatus("idle");
      setDetectedBg(null);
      setDetectedThreshold(null);

      try {
        const img = await loadImage(f);
        imgRef.current = img;

        if (mode === "smart") {
          await processSmart();
        } else {
          processManual();
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "فشل تحميل الصورة"
        );
      }
    },
    [mode, processSmart, processManual]
  );

  // ════════════════════════════════════════════
  // تبديل الوضع
  // ════════════════════════════════════════════
  const handleModeChange = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      if (imgRef.current && file) {
        if (newMode === "smart") {
          processSmart();
        } else {
          processManual();
        }
      }
    },
    [file, processSmart, processManual]
  );

  // ════════════════════════════════════════════
  // تحميل
  // ════════════════════════════════════════════
  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "signature";
    downloadBlob(resultBlob, `${name}-signature.png`);
  }, [resultBlob, file]);

  // ════════════════════════════════════════════
  // حالة فارغة
  // ════════════════════════════════════════════
  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت صورة التوقيع هنا"
        hint="يفضل توقيع بقلم أسود على ورق أبيض"
      />
    );
  }

  const isProcessing =
    mode === "smart" ? smartStatus === "processing" : false;

  return (
    <div className="space-y-6">
      {/* ─── شريط التحكم ─── */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        {/* تبديل الوضع */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium text-text-secondary">
            وضع المعالجة
          </span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => handleModeChange("smart")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "smart"
                  ? "bg-primary text-white"
                  : "bg-bg-surface text-text-secondary"
              }`}
            >
              🧠 ذكي
            </button>
            <button
              onClick={() => handleModeChange("manual")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "manual"
                  ? "bg-primary text-white"
                  : "bg-bg-surface text-text-secondary"
              }`}
            >
              ✋ يدوي
            </button>
          </div>
        </div>

        {/* تقدم المعالجة الذكية */}
        {mode === "smart" && smartStatus === "processing" && (
          <div className="mb-5">
            <ProgressBar message={smartMessage} />
          </div>
        )}

        {/* معلومات الذكاء بعد المعالجة */}
        {mode === "smart" && smartStatus === "done" && (
          <div className="mb-4 p-3 rounded-lg bg-bg-surface space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">نوع الخلفية المكتشفة:</span>
              <span className="font-medium text-text-secondary">
                {detectedBg === "light" ? "☀️ فاتحة" : "🌙 داكنة"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">العتبة المثالية (Otsu):</span>
              <span className="font-medium text-primary">
                {detectedThreshold}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">متوسط سطوع الخلفية:</span>
              {detectedBg !== null && (
                <span className="font-medium text-text-secondary">
                  {detectedBg === "light" ? "> 128" : "≤ 128"}
                </span>
              )}
            </div>
            <p className="text-xs text-success mt-2">
              ✓ Gaussian blur · decontamination · auto-crop
            </p>
          </div>
        )}

        {/* أدوات التحكم اليدوي */}
        {mode === "manual" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-text-secondary">
                نوع الخلفية
              </span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setBgMode("light")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    bgMode === "light"
                      ? "bg-primary text-white"
                      : "bg-bg-surface text-text-secondary"
                  }`}
                >
                  فاتحة
                </button>
                <button
                  onClick={() => setBgMode("dark")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    bgMode === "dark"
                      ? "bg-primary text-white"
                      : "bg-bg-surface text-text-secondary"
                  }`}
                >
                  داكنة
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-secondary">
                حساسية إزالة الخلفية
              </label>
              <span className="text-sm font-bold text-primary">
                {threshold}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={250}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-bg-surface rounded-lg accent-primary"
            />
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>
                {bgMode === "light" ? "إزالة أكثر (50)" : "إزالة أكثر (250)"}
              </span>
              <span>
                {bgMode === "light" ? "إزالة أقل (250)" : "إزالة أقل (50)"}
              </span>
            </div>

            <div className="flex items-center justify-between mb-3 mt-5">
              <label className="text-sm font-medium text-text-secondary">
                تنعيم الحواف
              </label>
              <span className="text-sm font-bold text-primary">{feather}</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-full h-2 bg-bg-surface rounded-lg accent-primary"
            />
            <div className="flex justify-between mt-2 text-xs text-text-muted">
              <span>ثنائي (0)</span>
              <span>ناعم جداً (50)</span>
            </div>
          </>
        )}

        {/* الخطأ */}
        {error && (
          <div className="mt-4 rounded-lg bg-danger/10 border border-danger/20 text-danger p-3 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* ─── المعاينة ─── */}
      <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-medium text-text-secondary">
            معاينة
          </span>
          <span className="text-xs text-text-muted">
            {file.name} · {formatFileSize(file.size)}
          </span>
        </div>

        {/* أزرار تبديل خلفية المعاينة */}
        {resultBlob && (
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-xs text-text-muted ml-2">الخلفية:</span>
            {(
              [
                ["checkerboard", "🏁 رقعة"],
                ["white", "⬜ أبيض"],
                ["black", "⬛ أسود"],
              ] as [PreviewBg, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPreviewBg(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  previewBg === key
                    ? "bg-primary text-white"
                    : "bg-bg-surface text-text-secondary hover:bg-bg-hover"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center p-4 min-h-[300px]">
          <canvas
            ref={previewCanvasRef}
            className="max-w-full max-h-[500px] object-contain"
          />
        </div>
      </div>

      {/* ─── أزرار الإجراءات ─── */}
      <div className="flex gap-3">
        <button
          onClick={() => handleFile(file!)}
          className="flex-1 rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors"
        >
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
