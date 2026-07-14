import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "تحويل الصور إلى PDF | دمج الصور في ملف PDF واحد | أدواتي",
  description:
    "أداة تحويل الصور إلى PDF مجانية — حوّل صورك إلى مستند PDF واحد بضغطة زر. يدعم JPG, PNG, WebP. معالجة في المتصفح بدون رفع للملفات.",
  alternates: { canonical: "https://adwati.com/landing/pdf" },
  openGraph: {
    title: "تحويل الصور إلى PDF | دمج الصور في ملف PDF واحد | أدواتي",
    description:
      "أداة تحويل الصور إلى PDF مجانية — حوّل صورك إلى مستند PDF واحد بضغطة زر. معالجة في المتصفح بدون رفع للملفات.",
    url: "https://adwati.com/landing/pdf",
    locale: "ar_SA",
    type: "website",
    siteName: "أدواتي - Adwati",
  },
  twitter: {
    card: "summary_large_image",
    title: "تحويل الصور إلى PDF | دمج الصور في ملف PDF واحد",
    description:
      "حوّل صورك إلى مستند PDF واحد بضغطة زر. مجاني، بدون رفع ملفات.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كيف أحول الصور إلى PDF؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "استخدم أداة تحويل الصور إلى PDF من أدواتي. ارفع صورة واحدة أو مجموعة صور (JPG, PNG, WebP)، رتبها بالترتيب الذي تريده، واضغط 'تحويل إلى PDF'. سيتم إنشاء ملف PDF واحد يحتوي على جميع الصور. حمّل الملف مباشرة.",
      },
    },
    {
      "@type": "Question",
      name: "كم صورة يمكن تحويلها إلى PDF؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا يوجد حد أقصى لعدد الصور! يمكنك تحويل أي عدد من الصور إلى مستند PDF واحد. كلما زاد عدد الصور زاد وقت المعالجة قليلاً، لكن الأداة مصممة للتعامل مع كميات كبيرة من الصور بكفاءة.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكنني ترتيب الصور في ملف PDF؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكنك سحب وإفلات الصور لإعادة ترتيبها قبل التحويل إلى PDF. الترتيب الذي تراه في الأداة هو نفس ترتيب الصفحات في ملف PDF الناتج. يمكنك أيضاً حذف أي صورة لا تريدها قبل التحويل.",
      },
    },
    {
      "@type": "Question",
      name: "هل التحويل من صور إلى PDF مجاني؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، أداة تحويل الصور إلى PDF مجانية تماماً. لا تحتاج إلى تسجيل أو اشتراك. يمكنك استخدامها لتحويل أي عدد من الصور إلى PDF بدون أي تكلفة أو حدود.",
      },
    },
    {
      "@type": "Question",
      name: "هل صوري آمنة أثناء التحويل إلى PDF؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، صورك في أمان تام. جميع عمليات التحويل تتم محلياً في متصفحك باستخدام مكتبات JavaScript. لا يتم رفع صورك إلى أي خادم، ولا يمكن لأحد غيرك الوصول إليها. خصوصيتك مضمونة.",
      },
    },
  ],
};

export default function PdfLandingPage() {
  return (
    <>
      <Script
        id="faq-schema-pdf"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-bg-main">
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
                <Link href="/tools" className="hover:text-primary transition-colors">
                  جميع الأدوات
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="text-5xl mb-4">🖼️➡️📄</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              تحويل الصور إلى PDF — سهل، سريع، مجاني
              <span className="block text-accent-light text-xl mt-2">
                دمج صورك في مستند PDF واحد بدون برامج
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              عندك مجموعة صور وتريد تحويلها إلى ملف PDF؟ أداتنا تحول صورك إلى
              مستند PDF واحد بضغطة زر. رتب الصور كما تريد، اختر الصيغة، وحمّل
              ملف PDF مباشرة. كل هذا في متصفحك بدون رفع أي ملف.
            </p>
            <div className="mt-8">
              <Link
                href="/tools/pdf/images-to-pdf"
                className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                🖼️➡️📄 جرب الأداة الآن — مجاناً
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-bg-card">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-text-main text-center mb-10">
              استخدامات تحويل الصور إلى PDF
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "📋 تجميع المستندات",
                  desc: "صورت مستندات متعددة (فواتير، عقود، إيصالات) وحولها إلى ملف PDF واحد منظم. مثالي للأرشفة والمشاركة.",
                },
                {
                  title: "📸 ألبوم صور",
                  desc: "حوّل مجموعة صور من رحلة، حفلة، أو مناسبة إلى ألبوم PDF أنيق يمكن مشاركته مع العائلة والأصدقاء.",
                },
                {
                  title: "📧 مرفقات البريد",
                  desc: "بدل إرسال عدة صور كمرفقات منفصلة، ادمجها في ملف PDF واحد ليسهل فتحها وتصفحها.",
                },
                {
                  title: "🏢 تقديم المستندات",
                  desc: "قدم طلبات رسمية بشكل احترافي عن طريق تحويل صور المستندات إلى ملف PDF واحد مرتب.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-bg-main p-6"
                >
                  <h3 className="font-bold text-text-main text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-bg-main">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-text-main text-center mb-10">
              كيف تحول صورك إلى PDF في ٣ خطوات
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "١",
                  title: "ارفع صورك",
                  desc: "اختر الصور من جهازك. يمكنك رفع صورة واحدة أو عدة صور دفعة واحدة.",
                },
                {
                  step: "٢",
                  title: "رتب واضبط",
                  desc: "اسحب الصور لإعادة ترتيبها كما تريد ظهورها في ملف PDF.",
                },
                {
                  step: "٣",
                  title: "حوّل وحمّل",
                  desc: "اضغط 'تحويل إلى PDF' وحمّل الملف الناتج مباشرة إلى جهازك.",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-bg-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-text-main mb-1">{s.title}</h3>
                  <p className="text-sm text-text-secondary">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-bg-card">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <article className="prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-4">
              <h2 className="text-2xl font-bold text-text-main">
                تحويل الصور إلى PDF: الأداة التي تحتاجها يومياً
              </h2>
              <p>
                هل تحتاج إلى تحويل مجموعة صور إلى ملف PDF واحد؟ سواء كنت
                طالباً تجمع صور المحاضرات، موظفاً تؤرشف المستندات، أو مصوراً
                تشارك ألبوم صور — أداتنا توفر لك الحل الأمثل. بدلاً من تثبيت
                برامج ثقيلة أو استخدام مواقع تطلب منك رفع صورك، يمكنك إنجاز
                المهمة في ثوانٍ من متصفحك مباشرة.
              </p>
              <p>
                تحويل الصور إلى PDF لم يكن بهذه السهولة من قبل. كل ما عليك
                فعله هو اختيار صورك — واحدة أو مئة — وترتيبها بالسحب والإفلات،
                ثم الضغط على زر التحويل. في لحظات، يصبح لديك ملف PDF احترافي
                جاهز للتحميل أو المشاركة. لا علامات مائية، لا حدود للاستخدام،
                لا اشتراكات.
              </p>
              <p>
                نضمن لك خصوصية كاملة. كل المعالجة تتم داخل متصفحك باستخدام
                تقنيات WebAssembly و JavaScript المتقدمة. صورك لا ترفع إلى
                الإنترنت ولا تخزن على أي خادم. هذا يعني أن مستنداتك الحساسة —
                صور الهوية، الفواتير، العقود — تبقى خاصة وآمنة تماماً.
              </p>
              <p>
                جربها اليوم. حول صورك إلى PDF واحفظها أو شاركها أو أرسلها عبر
                البريد الإلكتروني. الأداة تعمل على جميع الأجهزة: الكمبيوتر،
                اللابتوب، التابلت، وحتى الجوال.
              </p>
              <p className="text-center mt-8">
                <Link
                  href="/tools/pdf/images-to-pdf"
                  className="inline-block rounded-xl bg-primary hover:bg-primary-dark px-8 py-3 text-lg font-bold text-white shadow-lg transition-all"
                >
                  🖼️➡️📄 ابدأ تحويل صورك إلى PDF
                </Link>
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary-dark text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">
              حول صورك إلى PDF احترافي الآن!
            </h2>
            <p className="text-white/80 mb-6">
              دمج سريع، ترتيب مرن، خصوصية كاملة. مجاني للأبد.
            </p>
            <Link
              href="/tools/pdf/images-to-pdf"
              className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-10 py-3 text-lg font-bold text-white shadow-lg transition-all"
            >
              تحويل الصور إلى PDF — ابدأ الآن
            </Link>
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
    </>
  );
}
