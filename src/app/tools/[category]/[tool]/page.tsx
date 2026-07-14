import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolById } from "@/lib/tools";

export default function ToolPage({
  params,
}: {
  params: { category: string; tool: string };
}) {
  const tool = getToolById(params.tool);

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-primary">
              أدواتي
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-primary transition-colors">
                الرئيسية
              </Link>
              <Link
                href="/tools"
                className="hover:text-primary transition-colors"
              >
                جميع الأدوات
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-primary transition-colors">
            الأدوات
          </Link>
          <span>/</span>
          <Link
            href={`/tools/${tool.category}`}
            className="hover:text-primary transition-colors"
          >
            {tool.category === "pdf"
              ? "أدوات PDF"
              : tool.category === "image"
                ? "أدوات الصور"
                : "أدوات النصوص"}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{tool.nameAr}</span>
        </nav>
      </div>

      {/* Tool Header */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-5xl">{tool.icon}</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {tool.nameAr}
          </h1>
          <p className="mt-2 text-lg text-gray-500">{tool.descriptionAr}</p>
        </div>

        {/* Tool Workspace - Placeholder */}
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-lg text-gray-400 mb-4">
            أداة {tool.nameAr} قيد التطوير
          </p>
          <p className="text-sm text-gray-400">
            سيتم تفعيل هذه الأداة قريباً - المعالجة ستتم بالكامل في متصفحك
          </p>
        </div>

        {/* Related Tools */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            أدوات مشابهة
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tools/${tool.category}`}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              جميع أدوات{" "}
              {tool.category === "pdf"
                ? "PDF"
                : tool.category === "image"
                  ? "الصور"
                  : "النصوص"}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} أدواتي Adwati - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
