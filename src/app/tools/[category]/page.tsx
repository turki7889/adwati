import Link from "next/link";
import type { Metadata } from "next";
import { getToolsByCategory, getCategoryById, categories } from "@/lib/tools";

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = getCategoryById(params.category as "pdf" | "image" | "audio" | "signature");

  if (!category) {
    return {
      title: "الصفحة غير موجودة | أدواتي",
      description: "عذراً، الصفحة التي تبحث عنها غير موجودة.",
    };
  }

  const title = `${category.nameAr} | أدواتي - Adwati`;
  const description = `${category.descriptionAr} — جميع المعالجات تتم في متصفحك مباشرة بأمان كامل وبدون رفع للملفات.`;
  const url = `https://adwati.com/tools/${params.category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: "ar_SA",
      type: "website",
      siteName: "أدواتي - Adwati",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = getCategoryById(params.category as "pdf" | "image" | "audio" | "signature");

  if (!category) {
    return null;
  }

  const categoryTools = getToolsByCategory(category.id);

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
              <Link href="/tools" className="hover:text-primary transition-colors">
                جميع الأدوات
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-primary transition-colors">
            الأدوات
          </Link>
          <span>/</span>
          <span className="text-text-main font-medium">{category.nameAr}</span>
        </nav>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-primary-bg text-primary rounded-2xl flex items-center justify-center text-3xl">
            {category.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-main">
              {category.nameAr}
            </h1>
            <p className="text-text-secondary">{category.descriptionAr}</p>
          </div>
        </div>

        <p className="mt-6 mb-8 text-text-muted">
          {categoryTools.length} أدوات متاحة
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {categoryTools.map((tool) => (
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
      <footer className="border-t border-border bg-bg-surface py-8 mt-16">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-muted">
          <p>
            © {new Date().getFullYear()} أدواتي Adwati — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
