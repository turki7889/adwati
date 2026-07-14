"use client";

import { useState, useCallback, useRef, useEffect, type MouseEvent } from "react";
import UploadArea from "./shared/upload-area";
import {
  loadImage,
  cropImage,
  canvasToBlob,
  canvasToDataURL,
  downloadBlob,
  formatFileSize,
} from "@/lib/image-utils";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PRESET_RATIOS = [
  { label: "حر", w: 0, h: 0 },
  { label: "1:1", w: 1, h: 1 },
  { label: "4:3", w: 4, h: 3 },
  { label: "16:9", w: 16, h: 9 },
  { label: "3:2", w: 3, h: 2 },
];

export default function CropImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 100, h: 100 });
  const [preset, setPreset] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [dragging, setDragging] = useState<"move" | "nw" | "ne" | "sw" | "se" | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgDisplayRef = useRef<HTMLImageElement>(null);

  // Display dimensions
  const [displayRect, setDisplayRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setResultUrl(null);
    setResultBlob(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const image = await loadImage(f);
    setImg(image);
  }, []);

  // Initialize crop when image loads
  useEffect(() => {
    if (img && containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      const containerH = 400; // fixed height for crop area
      const scale = Math.min(containerW / img.width, containerH / img.height);
      const displayW = img.width * scale;
      const displayH = img.height * scale;

      // Default crop = center 50% of image
      const cropW = displayW * 0.5;
      const cropH = displayH * 0.5;
      const cx = (displayW - cropW) / 2;
      const cy = (displayH - cropH) / 2;

      setDisplayRect({ x: 0, y: 0, w: displayW, h: displayH });
      setCrop({ x: cx, y: cy, w: cropW, h: cropH });
    }
  }, [img]);

  const getMousePos = (e: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: MouseEvent, handle: "move" | "nw" | "ne" | "sw" | "se" | null) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getMousePos(e);
    setDragging(handle);
    setDragStart({ x: pos.x - crop.x, y: pos.y - crop.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const pos = getMousePos(e);
    const maxW = displayRect.w;
    const maxH = displayRect.h;

    const newCrop = { ...crop };

    if (dragging === "move") {
      newCrop.x = Math.max(0, Math.min(pos.x - dragStart.x, maxW - crop.w));
      newCrop.y = Math.max(0, Math.min(pos.y - dragStart.y, maxH - crop.h));
    } else if (dragging === "se") {
      newCrop.w = Math.max(20, Math.min(pos.x - crop.x, maxW - crop.x));
      newCrop.h = Math.max(20, Math.min(pos.y - crop.y, maxH - crop.y));
    } else if (dragging === "ne") {
      const newW = Math.max(20, Math.min(pos.x - crop.x, maxW - crop.x));
      const newH = Math.max(20, crop.y + crop.h - pos.y);
      if (newH !== crop.h) {
        newCrop.y = Math.max(0, pos.y);
        newCrop.h = newH;
      }
      newCrop.w = newW;
    } else if (dragging === "sw") {
      const newW = Math.max(20, crop.x + crop.w - pos.x);
      const newH = Math.max(20, Math.min(pos.y - crop.y, maxH - crop.y));
      if (newW !== crop.w) {
        newCrop.x = Math.max(0, pos.x);
        newCrop.w = newW;
      }
      newCrop.h = newH;
    } else if (dragging === "nw") {
      const newW = Math.max(20, crop.x + crop.w - pos.x);
      const newH = Math.max(20, crop.y + crop.h - pos.y);
      if (newW !== crop.w) {
        newCrop.x = Math.max(0, pos.x);
        newCrop.w = newW;
      }
      if (newH !== crop.h) {
        newCrop.y = Math.max(0, pos.y);
        newCrop.h = newH;
      }
    }

    // Enforce preset ratio
    if (preset.w > 0 && preset.h > 0) {
      const ratio = preset.w / preset.h;
      if (dragging === "se" || dragging === "nw" || dragging === "ne" || dragging === "sw") {
        newCrop.h = Math.round(newCrop.w / ratio);
        if (newCrop.y + newCrop.h > maxH) {
          newCrop.h = maxH - newCrop.y;
          newCrop.w = Math.round(newCrop.h * ratio);
        }
        if (newCrop.x + newCrop.w > maxW) {
          newCrop.w = maxW - newCrop.x;
          newCrop.h = Math.round(newCrop.w / ratio);
        }
      }
    }

    // Clamp
    newCrop.x = Math.max(0, newCrop.x);
    newCrop.y = Math.max(0, newCrop.y);
    newCrop.w = Math.min(newCrop.w, maxW - newCrop.x);
    newCrop.h = Math.min(newCrop.h, maxH - newCrop.y);

    setCrop(newCrop);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handlePresetChange = (pw: number, ph: number) => {
    setPreset({ w: pw, h: ph });
    if (pw > 0 && ph > 0 && displayRect.w > 0) {
      const ratio = pw / ph;
      const maxW = displayRect.w;
      const maxH = displayRect.h;

      let cropW = Math.min(maxW * 0.5, maxW);
      let cropH = Math.round(cropW / ratio);
      if (cropH > maxH) {
        cropH = maxH;
        cropW = Math.round(cropH * ratio);
      }
      const cx = (maxW - cropW) / 2;
      const cy = (maxH - cropH) / 2;
      setCrop({ x: cx, y: cy, w: cropW, h: cropH });
    }
  };

  const handleCrop = useCallback(async () => {
    if (!img) return;
    setProcessing(true);
    setError(null);
    try {
      const scaleX = img.width / displayRect.w;
      const scaleY = img.height / displayRect.h;

      const sx = Math.round(crop.x * scaleX);
      const sy = Math.round(crop.y * scaleY);
      const sw = Math.round(crop.w * scaleX);
      const sh = Math.round(crop.h * scaleY);

      const canvas = cropImage(img, sx, sy, sw, sh);
      const url = canvasToDataURL(canvas, "image/png");
      setResultUrl(url);

      const blob = await canvasToBlob(canvas, "image/png");
      setResultBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء القص");
    } finally {
      setProcessing(false);
    }
  }, [img, crop, displayRect]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;
    const name = file.name.replace(/\.[^.]+$/, "") || "cropped";
    downloadBlob(resultBlob, `${name}-cropped.png`);
  }, [resultBlob, file]);

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        label="اسحب وأفلت الصورة لقصها"
        hint="اسحب مقابض التحديد لتحديد منطقة القص"
      />
    );
  }

  // Calculate actual crop dimensions
  const scaleX = img ? img.width / displayRect.w : 1;
  const scaleY = img ? img.height / displayRect.h : 1;
  const actualCropW = Math.round(crop.w * scaleX);
  const actualCropH = Math.round(crop.h * scaleY);

  return (
    <div className="space-y-6">
      {/* نسب القص */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <p className="text-sm font-medium text-text-muted mb-3">نسبة القص</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_RATIOS.map((r) => (
            <button
              key={r.label}
              onClick={() => handlePresetChange(r.w, r.h)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                preset.w === r.w && preset.h === r.h
                  ? "bg-primary text-white"
                  : "bg-bg-surface text-text-secondary hover:bg-border"
              }`}
            >
              {r.label}
            </button>
          ))}
          {img && (
            <span className="mr-auto text-xs text-text-muted self-center">
              {actualCropW} × {actualCropH} px
            </span>
          )}
        </div>
      </div>

      {/* منطقة القص التفاعلية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-text-muted mb-3">حدد منطقة القص</p>
          <div
            ref={containerRef}
            className="relative w-full bg-bg-surface rounded-lg overflow-hidden select-none"
            style={{ height: 400 }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* الصورة */}
            {preview && displayRect.w > 0 && (
              <img
                ref={imgDisplayRef}
                src={preview}
                alt="قص"
                style={{
                  position: "absolute",
                  left: displayRect.x,
                  top: displayRect.y,
                  width: displayRect.w,
                  height: displayRect.h,
                  objectFit: "contain",
                }}
                draggable={false}
              />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              style={{
                clipPath: `polygon(
                  0% 0%, 0% 100%, ${(crop.x / (displayRect.w || 1)) * 100}% 100%,
                  ${(crop.x / (displayRect.w || 1)) * 100}% ${(crop.y / (displayRect.h || 1)) * 100}%,
                  ${((crop.x + crop.w) / (displayRect.w || 1)) * 100}% ${(crop.y / (displayRect.h || 1)) * 100}%,
                  ${((crop.x + crop.w) / (displayRect.w || 1)) * 100}% ${((crop.y + crop.h) / (displayRect.h || 1)) * 100}%,
                  ${(crop.x / (displayRect.w || 1)) * 100}% ${((crop.y + crop.h) / (displayRect.h || 1)) * 100}%,
                  ${(crop.x / (displayRect.w || 1)) * 100}% 100%, 100% 100%, 100% 0%
                )`,
              }}
            />

            {/* Crop border */}
            <div
              className="absolute border-2 border-primary cursor-move"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.w,
                height: crop.h,
              }}
              onMouseDown={(e) => handleMouseDown(e, "move")}
            >
              {/* Handles */}
              {(["nw", "ne", "sw", "se"] as const).map((handle) => (
                <div
                  key={handle}
                  className={`absolute w-3 h-3 bg-white border-2 border-primary rounded-sm ${
                    handle.includes("n") ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
                  } ${handle.includes("w") ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"}`}
                  style={{ cursor: `${handle}-resize` }}
                  onMouseDown={(e) => handleMouseDown(e, handle)}
                />
              ))}

              {/* Inner grid lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/30" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* نتيجة القص */}
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-sm font-medium text-text-muted mb-3">
            النتيجة ({actualCropW} × {actualCropH})
          </p>
          <div className="aspect-square bg-bg-surface rounded-lg overflow-hidden flex items-center justify-center">
            {resultUrl ? (
              <img src={resultUrl} alt="تم القص" className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-text-muted text-sm">اضغط &quot;قص&quot; للمعاينة</p>
            )}
          </div>
          {resultBlob && (
            <p className="mt-2 text-sm text-text-secondary">
              الحجم: {formatFileSize(resultBlob.size)}
            </p>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleCrop}
              disabled={processing}
              className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  جاري القص...
                </span>
              ) : (
                "قص ✂️"
              )}
            </button>

            {resultBlob && (
              <button
                onClick={handleDownload}
                className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                تحميل ⬇️
              </button>
            )}

            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setImg(null);
                setResultUrl(null);
                setResultBlob(null);
                setError(null);
              }}
              className="rounded-lg border border-border px-4 py-3 text-text-secondary hover:bg-bg-surface transition-colors"
            >
              إعادة
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-danger">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
