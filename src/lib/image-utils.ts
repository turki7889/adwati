"use client";

/**
 * أدوات مساعدة لمعالجة الصور باستخدام Canvas API
 * جميع العمليات تتم في المتصفح — لا رفع خارجي
 */

/** تحميل صورة من ملف */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("فشل تحميل الصورة"));
    };
    img.src = url;
  });
}

/** تحميل صورة من Blob */
export function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("فشل تحميل الصورة"));
    };
    img.src = url;
  });
}

/** `صيغ الصور المدعومة مع نوع MIME` */
export const IMAGE_FORMATS: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/avif": "AVIF",
};

/** `قائمة الصيغ للاختيار` */
export const FORMAT_OPTIONS = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/gif", label: "GIF" },
  { value: "image/bmp", label: "BMP" },
  { value: "image/avif", label: "AVIF (حسب دعم المتصفح)" },
];

/** `تحويل Canvas إلى Blob` */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = "image/png",
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("فشل تحويل الصورة"));
      },
      format,
      quality
    );
  });
}

/** `تحويل Canvas إلى Data URL` */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  format: string = "image/png",
  quality: number = 0.92
): string {
  return canvas.toDataURL(format, quality);
}

/** `تحميل Blob كملف` */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** `تنسيق الحجم للقراءة البشرية` */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 بايت";
  const units = ["بايت", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

/** `رسم صورة على Canvas مع تغيير الحجم` */
export function drawImageToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/** `رسم صورة على Canvas مع تغيير الحجم والحفاظ على التناسب (contain)` */
export function drawImageContain(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/** `قص الصورة حسب منطقة محددة` */
export function cropImage(
  img: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas;
}

/** `تطبيق فلاتر على الصورة` */
export function applyFilters(
  img: HTMLImageElement,
  filters: {
    brightness?: number; // 0-200, default 100
    contrast?: number; // 0-200, default 100
    saturation?: number; // 0-200, default 100
    grayscale?: number; // 0-100
  }
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;

  const b = filters.brightness ?? 100;
  const c = filters.contrast ?? 100;
  const s = filters.saturation ?? 100;
  const g = filters.grayscale ?? 0;

  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) grayscale(${g}%)`;
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";

  return canvas;
}

/** `إنشاء Canvas فارغ` */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** `الحصول على امتداد الملف من نوع MIME` */
export function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/avif": "avif",
  };
  return map[mimeType] || "png";
}
