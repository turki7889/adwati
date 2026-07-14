import Link from "next/link";
import type { Metadata } from "next";
import { categories, tools, popularToolIds } from "@/lib/tools";

export const metadata: Metadata = {
  title: "أدواتي - Adwati | أدوات ويب عربية مجانية وآمنة",
  description:
    "أدواتي - منصة الأدوات العربية المجانية. معالجة PDF، تحرير الصور، تحويل الصوتيات وغيرها الكثير. جميع المعالجات تتم في المتصفح بأمان كامل — بدون رفع للملفات.",
  alternates: { canonical: "https://adwati.com" },
  openGraph: {
    title: "أدواتي - Adwati | أدوات ويب عربية مجانية وآمنة",
    description:
      "منصة الأدوات العربية المجانية — معالجة PDF، تحرير الصور، تحويل الصوتيات. كل المعالجات في متصفحك بدون رفع للملفات.",
    url: "https://adwati.com",
    locale: "ar_SA",
    type: "website",
    siteName: "أدواتي - Adwati",
  },
  twitter: {
    card: "summary_large_image",
    title: "أدواتي - Adwati | أدوات ويب عربية مجانية وآمنة",
    description:
      "منصة الأدوات العربية المجانية — معالجة PDF، تحرير الصور، تحويل الصوتيات.",
  },
};

export default function HomePage() {
  const popularTools = tools.filter((t) => popularToolIds.includes(t.id));
  const privacyFeatures = [
    { icon: "🔒", text: "معالجة محلية بالكامل", sub: "ملفاتك لا تغادر جهازك أبداً" },
    { icon: "⚡", text: "سرعة فائقة", sub: "معالجة فورية بدون انتظار رفع" },
    { icon: "🆓", text: "مجاني للأبد", sub: "بدون تسجيل وبدون حدود" },
  ];

  return (
    <div className="min-h-screen">
      {/* Trust Bar */}
      <div className="bg-primary-dark text-white/90 border-b border-primary">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm">
          <span>🔒 معالجة محلية بالكامل</span>
          <span>🚫 لا رفع للملفات</span>
          <span>🆓 مجاني للأبد</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold text-primary">
              أدواتي
              <span className="mr-2 text-lg font-normal text-text-muted">
                Adwati
              </span>
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-text-secondary">
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
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            أدوات ويب عربية
            <span className="block text-accent-light">سريعة وآمنة ومجانية</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            جميع المعالجات تتم في متصفحك مباشرة. لا يتم رفع ملفاتك إلى أي
            خادم.
            <br />
            خصوصيتك أولاً.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/tools"
              className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all"
            >
              استكشف جميع الأدوات
            </Link>
            <Link
              href="/tools/image/absher-image"
              className="inline-block rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-all"
            >
              🛂 تصغير صورة أبشر
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Promise */}
      <section className="py-12 bg-bg-card">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {privacyFeatures.map((feat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-bg-main p-6 text-center"
              >
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="font-bold text-text-main">{feat.text}</h3>
                <p className="text-sm text-text-secondary mt-1">{feat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-bg-main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-main mb-2 text-center">
            تصفح الأدوات حسب الفئة
          </h2>
          <p className="text-text-secondary text-center mb-8">
            اختر الفئة التي تحتاجها وابدأ فوراً
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/tools/${cat.id}`}
                className="group rounded-2xl border border-border bg-bg-card p-6 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-primary-bg text-primary rounded-xl flex items-center justify-center text-2xl mb-4">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors">
                  {cat.nameAr}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {cat.descriptionAr}
                </p>
                <span className="mt-3 inline-block text-xs bg-primary-bg text-primary px-3 py-1 rounded-full font-medium">
                  {tools.filter((t) => t.category === cat.id).length} أدوات
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-16 bg-bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-main mb-2 text-center">
            الأدوات الأكثر استخداماً
          </h2>
          <p className="text-text-secondary text-center mb-8">
            أدوات يبحث عنها آلاف المستخدمين يومياً
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-main p-4 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all"
              >
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-semibold text-text-main">
                    {tool.nameAr}
                  </h3>
                  <p className="text-sm text-text-secondary">{tool.descriptionAr}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
            >
              جميع الأدوات ←
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-text-muted">
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
