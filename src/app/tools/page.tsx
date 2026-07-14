import Link from "next/link";
import type { Metadata } from "next";
import { tools, categories } from "@/lib/tools";

export const metadata: Metadata = {
  title: "جميع الأدوات | أدواتي - Adwati",
  description:
    "تصفح جميع أدوات أدواتي المجانية — أدوات PDF، أدوات الصور، أدوات الصوت. جميع المعالجات تتم في متصفحك بأمان كامل وبدون رفع للملفات.",
  alternates: { canonical: "https://adwati.com/tools" },
  openGraph: {
    title: "جميع الأدوات | أدواتي - Adwati",
    description:
      "تصفح جميع أدوات أدواتي المجانية — أدوات PDF، أدوات الصور، أدوات الصوت.",
    url: "https://adwati.com/tools",
    locale: "ar_SA",
    type: "website",
    siteName: "أدواتي - Adwati",
  },
  twitter: {
    card: "summary_large_image",
    title: "جميع الأدوات | أدواتي - Adwati",
    description:
      "تصفح جميع أدوات أدواتي المجانية — أدوات PDF، أدوات الصور، أدوات الصوت.",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-primary">
              أدواتي
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-text-secondary">
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
        <h1 className="text-3xl font-bold text-text-main mb-2">
          جميع الأدوات
        </h1>
        <p className="text-text-secondary mb-8">
          {tools.length} أداة مجانية — جميع المعالجات في المتصفح
        </p>

        {/* Category sections */}
        {categories.map((cat) => (
          <section key={cat.id} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-bg text-primary rounded-xl flex items-center justify-center text-xl">
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold text-text-main">
                {cat.nameAr}
              </h2>
              <span className="text-sm text-text-muted">
                ({tools.filter((t) => t.category === cat.id).length})
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools
                .filter((t) => t.category === cat.id)
                .map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.route}
                    className="flex items-start gap-4 rounded-xl border border-border bg-bg-card p-5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all"
                  >
                    <span className="text-3xl mt-0.5">{tool.icon}</span>
                    <div>
                      <h3 className="font-bold text-text-main">{tool.nameAr}</h3>
                      <p className="mt-1 text-sm text-text-secondary">
                        {tool.descriptionAr}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-muted">
          <p>
            © {new Date().getFullYear()} أدواتي Adwati — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
