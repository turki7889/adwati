"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { downloadBlob } from "@/lib/image-utils";

export default function DrawSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // الحصول على الإحداثيات الصحيحة من الحدث (ماوس أو لمس)
  const getCanvasPos = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // بدء الرسم
  const startDrawing = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getCanvasPos(clientX, clientY);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      setIsDrawing(true);
      lastPosRef.current = pos;

      // رسم نقطة صغيرة عند البداية
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, penWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = penColor;
      ctx.fill();
    },
    [getCanvasPos, penColor, penWidth]
  );

  // متابعة الرسم
  const continueDrawing = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pos = getCanvasPos(clientX, clientY);
      const lastPos = lastPosRef.current;
      if (!lastPos) return;

      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPosRef.current = pos;
      setHasDrawn(true);
    },
    [isDrawing, penColor, penWidth, getCanvasPos]
  );

  // إنهاء الرسم
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      startDrawing(e.clientX, e.clientY);
    },
    [startDrawing]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      continueDrawing(e.clientX, e.clientY);
    },
    [continueDrawing]
  );

  const handleMouseUp = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);

  const handleMouseLeave = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      startDrawing(touch.clientX, touch.clientY);
    },
    [startDrawing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      continueDrawing(touch.clientX, touch.clientY);
    },
    [continueDrawing]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      stopDrawing();
    },
    [stopDrawing]
  );

  // تهيئة canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = rect.width || 700;
    const height = 350;

    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  // مسح الرسمة
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    setHasDrawn(false);
  }, []);

  // تحميل PNG
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, "signature.png");
      }
    }, "image/png");
  }, []);

  return (
    <div className="space-y-6">
      {/* شريط الأدوات */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* لون القلم */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-secondary">
              لون القلم:
            </label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer p-1"
            />
          </div>

          {/* سمك الخط */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-text-secondary">
              سمك الخط:
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={penWidth}
              onChange={(e) => setPenWidth(Number(e.target.value))}
              className="flex-1 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm font-bold text-primary w-8 tabular-nums">
              {penWidth}
            </span>
          </div>

          {/* أزرار */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="rounded-lg border border-border px-4 py-2.5 text-text-secondary hover:bg-bg-surface transition-colors text-sm font-medium"
            >
              🗑️ مسح
            </button>
            <button
              onClick={handleDownload}
              disabled={!hasDrawn}
              className="rounded-lg bg-success px-6 py-2.5 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
            >
              ⬇️ تحميل PNG
            </button>
          </div>
        </div>

        {/* معاينة سمك الخط */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-text-muted">المعاينة:</span>
          <svg width="80" height="30" className="inline-block">
            <line
              x1="5"
              y1="15"
              x2="75"
              y2="15"
              stroke={penColor}
              strokeWidth={penWidth}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* مساحة الرسم */}
      <div className="rounded-xl border-2 border-border bg-bg-card overflow-hidden">
        <div className="bg-white mx-4 my-4 rounded-lg border border-border overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full cursor-crosshair touch-none block"
          />
        </div>
        <div className="px-4 py-3 border-t border-border bg-bg-surface text-center">
          <p className="text-sm text-text-muted">
            {hasDrawn
              ? "🖊️ ارسم توقيعك باستخدام الفأرة أو اللمس — اضغط تحميل PNG للحفظ"
              : "👆 ابدأ برسم توقيعك هنا باستخدام الفأرة أو اللمس"}
          </p>
        </div>
      </div>
    </div>
  );
}
