export type Category = "pdf" | "image" | "text";

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
    id: "pdf",
    name: "PDF Tools",
    nameAr: "أدوات PDF",
    description: "Merge, split, compress and edit PDF files",
    descriptionAr: "دمج وتقسيم وضغط وتحرير ملفات PDF",
    icon: "📄",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "image",
    name: "Image Tools",
    nameAr: "أدوات الصور",
    description: "Convert, resize, compress and edit images",
    descriptionAr: "تحويل وتغيير حجم وضغط وتحرير الصور",
    icon: "🖼️",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "text",
    name: "Text Tools",
    nameAr: "أدوات النصوص",
    description: "Count, convert, generate and analyze text",
    descriptionAr: "عد وتحويل وتوليد وتحليل النصوص",
    icon: "📝",
    color: "bg-green-50 text-green-700 border-green-200",
  },
];

export const tools: Tool[] = [
  // ===== PDF Tools =====
  {
    id: "merge-pdf",
    name: "Merge PDF",
    nameAr: "دمج PDF",
    description: "Combine multiple PDF files into a single document",
    descriptionAr: "دمج عدة ملفات PDF في مستند واحد",
    category: "pdf",
    icon: "📎",
    route: "/tools/pdf/merge-pdf",
    color: "hover:bg-red-100",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    nameAr: "تقسيم PDF",
    description: "Split a PDF into multiple files by pages",
    descriptionAr: "تقسيم ملف PDF إلى عدة ملفات حسب الصفحات",
    category: "pdf",
    icon: "✂️",
    route: "/tools/pdf/split-pdf",
    color: "hover:bg-red-100",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    nameAr: "ضغط PDF",
    description: "Reduce PDF file size while maintaining quality",
    descriptionAr: "تقليل حجم ملف PDF مع الحفاظ على الجودة",
    category: "pdf",
    icon: "📦",
    route: "/tools/pdf/compress-pdf",
    color: "hover:bg-red-100",
  },
  {
    id: "pdf-to-images",
    name: "PDF to Images",
    nameAr: "PDF إلى صور",
    description: "Convert PDF pages to image formats (PNG, JPEG)",
    descriptionAr: "تحويل صفحات PDF إلى صيغ الصور (PNG, JPEG)",
    category: "pdf",
    icon: "🔄",
    route: "/tools/pdf/pdf-to-images",
    color: "hover:bg-red-100",
  },

  // ===== Image Tools =====
  {
    id: "image-convert",
    name: "Image Converter",
    nameAr: "تحويل الصور",
    description: "Convert images between PNG, JPEG, WebP, and more",
    descriptionAr: "تحويل الصور بين PNG و JPEG و WebP وغيرها",
    category: "image",
    icon: "🔄",
    route: "/tools/image/image-convert",
    color: "hover:bg-blue-100",
  },
  {
    id: "image-resize",
    name: "Image Resize",
    nameAr: "تغيير حجم الصورة",
    description: "Resize images by dimensions or percentage",
    descriptionAr: "تغيير حجم الصور بالأبعاد أو النسبة المئوية",
    category: "image",
    icon: "📐",
    route: "/tools/image/image-resize",
    color: "hover:bg-blue-100",
  },
  {
    id: "image-compress",
    name: "Image Compress",
    nameAr: "ضغط الصور",
    description: "Compress images to reduce file size",
    descriptionAr: "ضغط الصور لتقليل حجم الملف",
    category: "image",
    icon: "📦",
    route: "/tools/image/image-compress",
    color: "hover:bg-blue-100",
  },
  {
    id: "image-watermark",
    name: "Image Watermark",
    nameAr: "علامة مائية",
    description: "Add text or image watermarks to pictures",
    descriptionAr: "إضافة علامات مائية نصية أو صورية",
    category: "image",
    icon: "💧",
    route: "/tools/image/image-watermark",
    color: "hover:bg-blue-100",
  },

  // ===== Text Tools =====
  {
    id: "text-counter",
    name: "Text Counter",
    nameAr: "عداد الكلمات",
    description: "Count words, characters, sentences and paragraphs",
    descriptionAr: "عد الكلمات والأحرف والجمل والفقرات",
    category: "text",
    icon: "🔢",
    route: "/tools/text/text-counter",
    color: "hover:bg-green-100",
  },
  {
    id: "text-case",
    name: "Text Case",
    nameAr: "تحويل حالة النص",
    description: "Convert text case: upper, lower, title, sentence",
    descriptionAr: "تحويل حالة النص: كبير، صغير، عنوان، جملة",
    category: "text",
    icon: "🔤",
    route: "/tools/text/text-case",
    color: "hover:bg-green-100",
  },
  {
    id: "text-diff",
    name: "Text Diff",
    nameAr: "مقارنة النصوص",
    description: "Compare two texts and highlight differences",
    descriptionAr: "مقارنة نصين وإظهار الاختلافات بينهما",
    category: "text",
    icon: "⚖️",
    route: "/tools/text/text-diff",
    color: "hover:bg-green-100",
  },
  {
    id: "text-encoder",
    name: "Text Encoder",
    nameAr: "تشفير النصوص",
    description: "Encode/decode Base64, URL, HTML entities",
    descriptionAr: "تشفير وفك تشفير Base64 و URL و HTML",
    category: "text",
    icon: "🔐",
    route: "/tools/text/text-encoder",
    color: "hover:bg-green-100",
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
