export type Category = "image" | "pdf" | "audio";

export interface Tool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: Category;
  icon: string;
  route: string;
  color: string;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
}

export const categories: CategoryInfo[] = [
  {
    id: "image",
    name: "Image Tools",
    nameAr: "أدوات الصور",
    description: "Convert, compress, resize, crop, and edit images — all in your browser",
    descriptionAr: "تحويل وضغط وتغيير حجم وقص وتحرير الصور — كله في متصفحك",
    icon: "🖼️",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "pdf",
    name: "PDF Tools",
    nameAr: "أدوات PDF",
    description: "Merge, split, convert, and secure PDF files — no upload needed",
    descriptionAr: "دمج وتقسيم وتحويل وتأمين ملفات PDF — بدون رفع للملفات",
    icon: "📄",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "audio",
    name: "Audio Tools",
    nameAr: "أدوات الصوت",
    description: "Convert audio formats instantly in your browser",
    descriptionAr: "تحويل صيغ الصوت فوراً في متصفحك",
    icon: "🎵",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export const tools: Tool[] = [
  // ===== أدوات الصور (7) =====
  {
    id: "convert-image",
    name: "Image Converter",
    nameAr: "تحويل صيغ الصور",
    description: "Convert between JPG, PNG, WebP, GIF, BMP, AVIF",
    descriptionAr: "تحويل بين JPG و PNG و WebP و GIF و BMP و AVIF",
    category: "image",
    icon: "🔄",
    route: "/tools/image/convert-image",
    color: "hover:bg-blue-100",
  },
  {
    id: "compress-image",
    name: "Image Compressor",
    nameAr: "ضغط الصور",
    description: "Reduce image file size with quality control",
    descriptionAr: "تقليل حجم الصورة مع التحكم في الجودة",
    category: "image",
    icon: "📦",
    route: "/tools/image/compress-image",
    color: "hover:bg-blue-100",
  },
  {
    id: "resize-image",
    name: "Image Resizer",
    nameAr: "تغيير أبعاد الصور",
    description: "Resize by pixels or percentage, maintain aspect ratio",
    descriptionAr: "تغيير الأبعاد بالبكسل أو النسبة مع الحفاظ على التناسب",
    category: "image",
    icon: "📐",
    route: "/tools/image/resize-image",
    color: "hover:bg-blue-100",
  },
  {
    id: "crop-image",
    name: "Image Cropper",
    nameAr: "قص الصور",
    description: "Crop images with preset ratios (1:1, 4:3, 16:9)",
    descriptionAr: "قص الصور بنسب جاهزة (1:1، 4:3، 16:9)",
    category: "image",
    icon: "✂️",
    route: "/tools/image/crop-image",
    color: "hover:bg-blue-100",
  },
  {
    id: "filter-image",
    name: "Image Filters",
    nameAr: "فلاتر الصور",
    description: "Apply B&W, brightness, contrast, saturation filters",
    descriptionAr: "تطبيق فلاتر أبيض وأسود وسطوع وتباين وتشبع",
    category: "image",
    icon: "🎨",
    route: "/tools/image/filter-image",
    color: "hover:bg-blue-100",
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    nameAr: "منشئ الأيقونات",
    description: "Generate favicons in multiple sizes (16×16 to 256×256)",
    descriptionAr: "توليد أيقونات المواقع بمقاسات متعددة (16×16 إلى 256×256)",
    category: "image",
    icon: "⭐",
    route: "/tools/image/favicon-generator",
    color: "hover:bg-blue-100",
  },
  {
    id: "absher-image",
    name: "Absher Photo Resizer",
    nameAr: "تصغير صورة أبشر ⭐",
    description: "Resize photo to 200×200px for Absher platform — Saudi MOI",
    descriptionAr: "تصغير الصورة إلى 200×200 بكسل لمنصة أبشر — وزارة الداخلية السعودية",
    category: "image",
    icon: "🛂",
    route: "/tools/image/absher-image",
    color: "hover:bg-blue-100",
  },

  // ===== أدوات PDF (4) =====
  {
    id: "merge-pdf",
    name: "PDF Merger",
    nameAr: "دمج PDF",
    description: "Combine multiple PDFs into one file",
    descriptionAr: "دمج عدة ملفات PDF في ملف واحد",
    category: "pdf",
    icon: "📎",
    route: "/tools/pdf/merge-pdf",
    color: "hover:bg-red-100",
  },
  {
    id: "split-pdf",
    name: "PDF Splitter",
    nameAr: "تقسيم PDF",
    description: "Extract specific pages from a PDF",
    descriptionAr: "استخراج صفحات محددة من ملف PDF",
    category: "pdf",
    icon: "✂️",
    route: "/tools/pdf/split-pdf",
    color: "hover:bg-red-100",
  },
  {
    id: "images-to-pdf",
    name: "Images to PDF",
    nameAr: "تحويل الصور إلى PDF",
    description: "Convert multiple images into a single PDF document",
    descriptionAr: "تحويل مجموعة صور إلى مستند PDF واحد",
    category: "pdf",
    icon: "🖼️",
    route: "/tools/pdf/images-to-pdf",
    color: "hover:bg-red-100",
  },
  {
    id: "protect-pdf",
    name: "PDF Encrypt / Decrypt",
    nameAr: "تشفير وفك تشفير PDF",
    description: "Add or remove password protection from PDF files",
    descriptionAr: "إضافة أو إزالة كلمة مرور من ملفات PDF",
    category: "pdf",
    icon: "🔐",
    route: "/tools/pdf/protect-pdf",
    color: "hover:bg-red-100",
  },

  // ===== أدوات الصوت (1) =====
  {
    id: "convert-audio",
    name: "Audio Converter",
    nameAr: "تحويل صيغ الصوت",
    description: "Convert between MP3, WAV, M4A, OGG, FLAC using FFmpeg",
    descriptionAr: "تحويل بين MP3 و WAV و M4A و OGG و FLAC عبر FFmpeg",
    category: "audio",
    icon: "🔊",
    route: "/tools/audio/convert-audio",
    color: "hover:bg-purple-100",
  },
];

export function getToolsByCategory(category: Category): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getCategoryById(id: Category): CategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}

/** عدد الأدوات الإجمالي */
export const TOTAL_TOOLS = tools.length;

/** أكثر الأدوات بحثاً لعرضها في الصفحة الرئيسية */
export const popularToolIds = ["absher-image", "merge-pdf", "convert-image", "compress-image", "images-to-pdf", "favicon-generator"];
