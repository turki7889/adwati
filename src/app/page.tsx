import Link from "next/link";
import { categories, tools, popularToolIds } from "@/lib/tools";

export default function HomePage() {
  const popularTools = tools.filter((t) => popularToolIds.includes(t.id));
  const privacyFeatures = [
    { icon: "🔒", text: "جميع المعالجات في متصفحك", sub: "ملفاتك لا تغادر جهازك أبداً" },
    { icon: "⚡", text: "سرعة فائقة", sub: "معالجة فورية بدون انتظار رفع" },
    { icon: "🆓", text: "مجاني بالكامل", sub: "بدون تسجيل وبدون حدود" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-primary">
              أدواتي
              <span className="mr-2 text-lg font-normal text-gray-400">
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
            <span className="block text-primary">سريعة وآمنة ومجانية</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            جميع المعالجات تتم في متصفحك مباشرة. لا يتم رفع ملفاتك إلى أي
            خادم.
            <br />
            خصوصيتك أولاً.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="inline-block rounded-xl bg-primary px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-primary-dark transition-all"
            >
              استكشف جميع الأدوات
            </Link>
            <Link
              href="/tools/image/absher-image"
              className="inline-block rounded-xl border-2 border-primary bg-white px-8 py-3 text-lg font-semibold text-primary hover:bg-primary/5 transition-all"
            >
              🛂 تصغير صورة أبشر
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Promise */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {privacyFeatures.map((feat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center"
              >
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="font-bold text-gray-900">{feat.text}</h3>
                <p className="text-sm text-gray-500 mt-1">{feat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
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
            {popularTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 hover:border-primary/30 transition-all"
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
            © {new Date().getFullYear()} أدواتي Adwati — جميع الحقوق محفوظة
          </p>
          <p className="mt-1">
            جميع المعالجات تتم محلياً في متصفحك — ملفاتك لا تغادر جهازك
          </p>
        </div>
      </footer>
    </div>
  );
}
