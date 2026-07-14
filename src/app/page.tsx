import Link from "next/link";
import { categories, tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-primary">
              أدواتي
              <span className="ml-2 text-lg font-normal text-gray-400">
                Adwati
              </span>
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

      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary/5 to-accent/5 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            أدوات ويب عربية
            <span className="block text-primary">مجانية وآمنة</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            جميع المعالجات تتم في متصفحك مباشرة. لا يتم رفع ملفاتك إلى أي خادم.
            <br />
            خصوصيتك أولاً.
          </p>
          <Link
            href="/tools"
            className="mt-8 inline-block rounded-xl bg-primary px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-primary-dark transition-all"
          >
            استكشف الأدوات
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            تصفح الأدوات حسب الفئة
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/tools/${cat.id}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {cat.nameAr}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {cat.descriptionAr}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  {tools.filter((t) => t.category === cat.id).length} أدوات
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            الأدوات الأكثر استخداماً
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.slice(0, 6).map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {tool.nameAr}
                  </h3>
                  <p className="text-sm text-gray-500">{tool.descriptionAr}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} أدواتي Adwati - جميع الحقوق محفوظة
          </p>
          <p className="mt-1">جميع المعالجات تتم محلياً في متصفحك</p>
        </div>
      </footer>
    </div>
  );
}
