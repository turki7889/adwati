import Link from "next/link";
import { tools } from "@/lib/tools";

export default function ToolsPage() {
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
                className="text-primary font-semibold"
              >
                جميع الأدوات
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          جميع الأدوات
        </h1>
        <p className="text-gray-500 mb-8">
          {tools.length} أداة مجانية - جميع المعالجات في المتصفح
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
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
                <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-600">
                  {tool.category === "pdf"
                    ? "PDF"
                    : tool.category === "image"
                      ? "صور"
                      : "نصوص"}
                </span>
              </div>
            </Link>
          ))}
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
