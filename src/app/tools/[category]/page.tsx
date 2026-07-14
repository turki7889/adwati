import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolsByCategory, getCategoryById } from "@/lib/tools";

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategoryById(params.category as "pdf" | "image" | "text");

  if (!category) {
    notFound();
  }

  const categoryTools = getToolsByCategory(category.id);

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
          <span className="text-gray-900 font-medium">{category.nameAr}</span>
        </nav>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category.nameAr}
            </h1>
            <p className="text-gray-500">{category.descriptionAr}</p>
          </div>
        </div>

        <p className="mt-6 mb-8 text-gray-500">
          {categoryTools.length} أدوات متاحة
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {categoryTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.route}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <span className="text-3xl mt-0.5">{tool.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900">{tool.nameAr}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {tool.descriptionAr}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/tools"
            className="text-primary hover:text-primary-dark font-medium transition-colors"
          >
            ← عرض جميع الأدوات
          </Link>
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
