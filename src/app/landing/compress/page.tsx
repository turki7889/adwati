import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "ضغط الصور أونلاين | تقليل حجم الصورة مع الحفاظ على الجودة | أدواتي",
  description:
    "أداة ضغط الصور المجانية — قلل حجم صورك حتى 90% بدون خسارة ملحوظة في الجودة. يعمل في المتصفح، بدون رفع للملفات. ادعم JPG, PNG, WebP.",
  alternates: { canonical: "https://adwati.com/landing/compress" },
  openGraph: {
    title: "ضغط الصور أونلاين | تقليل حجم الصورة مع الحفاظ على الجودة | أدواتي",
    description:
      "أداة ضغط الصور المجانية — قلل حجم صورك حتى 90% بدون خسارة ملحوظة في الجودة. يعمل في المتصفح، بدون رفع للملفات.",
    url: "https://adwati.com/landing/compress",
    locale: "ar_SA",
    type: "website",
    siteName: "أدواتي - Adwati",
  },
  twitter: {
    card: "summary_large_image",
    title: "ضغط الصور أونلاين | تقليل حجم الصورة مع الحفاظ على الجودة",
    description:
      "قلل حجم صورك حتى 90% بدون خسارة ملحوظة في الجودة. مجاني، بدون رفع ملفات.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كيف أضغط الصور بدون خسارة في الجودة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "أداة ضغط الصور من أدواتي تتيح لك التحكم بنسبة الجودة (من 10% إلى 100%). يمكنك مشاهدة معاينة فورية للصورة المضغوطة ومقارنتها مع الأصل قبل التحميل. اختر نسبة الجودة المناسبة لتحصل على أفضل توازن بين الحجم والوضوح.",
      },
    },
    {
      "@type": "Question",
      name: "كم يمكن تقليل حجم الصورة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يمكن تقليل حجم الصورة بنسبة تصل إلى 90% حسب إعدادات الجودة التي تختارها. الصور بصيغة PNG يمكن تحويلها إلى JPG أو WebP لمزيد من الضغط. النتيجة تعتمد على محتوى الصورة ونسبة الجودة المختارة.",
      },
    },
    {
      "@type": "Question",
      name: "هل أداة ضغط الصور آمنة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، أداة ضغط الصور آمنة تماماً. جميع المعالجات تتم في متصفحك محلياً (Client-Side). لا يتم إرسال صورك إلى أي خادم خارجي، ولا يتم تخزينها أو مشاركتها مع أي طرف ثالث.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي صيغ الصور المدعومة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تدعم الأداة جميع الصيغ الشائعة: JPG، JPEG، PNG، WebP، GIF، BMP. يمكنك ضغط أي صورة من هذه الصيغ وتحميلها بصيغة JPG أو PNG أو WebP أو الصيغة الأصلية.",
      },
    },
    {
      "@type": "Question",
      name: "لماذا أحتاج لضغط الصور؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ضغط الصور ضروري لتحسين سرعة المواقع الإلكترونية، تقليل استهلاك النطاق الترددي، تسريع إرسال الصور عبر البريد الإلكتروني ووسائل التواصل، وتوفير مساحة التخزين على جهازك. الصور المضغوطة تحمّل أسرع ولا تؤثر على تجربة المستخدم.",
      },
    },
  ],
};

export default function CompressLandingPage() {
  return (
    <>
      <Script
        id="faq-schema-compress"
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
            <div className="text-5xl mb-4">📦</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              ضغط الصور أونلاين — قلل الحجم وحافظ على الجودة
              <span className="block text-accent-light text-xl mt-2">
                أسرع أداة ضغط صور في المتصفح — مجانية تماماً
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              صورك كبيرة جداً؟ قلل حجمها حتى 90% مع الحفاظ على جودة ممتازة.
              مثالية لتحسين سرعة موقعك، تقليل حجم المرفقات، وتوفير مساحة
              التخزين. بدون رفع للملفات — كل المعالجة في متصفحك.
            </p>
            <div className="mt-8">
              <Link
                href="/tools/image/compress-image"
                className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                📦 جرب أداة ضغط الصور الآن — مجاناً
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-bg-card">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-text-main text-center mb-10">
              مزايا أداة ضغط الصور من أدواتي
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "🎚️ تحكم كامل بالجودة",
                  desc: "شريط تمرير من 10% إلى 100% لتحديد مستوى الضغط المناسب لاحتياجك. وازن بين الحجم والجودة.",
                },
                {
                  title: "👀 معاينة فورية",
                  desc: "شاهد الصورة المضغوطة فوراً وقارنها مع الأصل. الحجم قبل وبعد يظهر بوضوح لتتخذ القرار الصحيح.",
                },
                {
                  title: "🔄 صيغ متعددة",
                  desc: "ادعم جميع صيغ الصور: JPG, PNG, WebP, GIF, BMP. حمّل النتيجة بالصيغة التي تناسبك.",
                },
                {
                  title: "🔒 خصوصية محلية",
                  desc: "لا رفع، لا خوادم، لا تخزين. صورتك تعالج في متصفحك فقط. مناسبة للصور الحساسة والخاصة.",
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
              كيف تضغط صورك في ٣ خطوات
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "١",
                  title: "اختر الصورة",
                  desc: "ارفع صورتك بأي صيغة — JPG, PNG, WebP, أو غيرها.",
                },
                {
                  step: "٢",
                  title: "اضبط الجودة",
                  desc: "حرك شريط الجودة حتى تحصل على الحجم والجودة المناسبين.",
                },
                {
                  step: "٣",
                  title: "حمّل النتيجة",
                  desc: "اضغط تحميل لتحفظ الصورة المضغوطة بالصيغة التي تفضلها.",
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
                لماذا ضغط الصور مهم لموقعك وعملك؟
              </h2>
              <p>
                في عالم الويب السريع، سرعة تحميل الصفحة عامل حاسم في تجربة
                المستخدم وترتيب محركات البحث. الصور غير المضغوطة هي السبب
                الأول في بطء المواقع. بإمكان صورة واحدة غير مضغوطة أن تضيف
                ثوانٍ إلى وقت التحميل — وهذا يعني خسارة زوار وخسارة مبيعات.
              </p>
              <p>
                أداة ضغط الصور من أدواتي تحل هذه المشكلة بكل بساطة. بدلاً من
                استخدام برامج معقدة مثل فوتوشوب أو أدوات مدفوعة، يمكنك ضغط أي
                صورة في ثوانٍ من متصفحك مباشرة. النتيجة: صور أصغر حجماً مع
                جودة ممتازة، وجاهزة للاستخدام على موقعك، مدونتك، متجرك
                الإلكتروني، أو حسابات التواصل الاجتماعي.
              </p>
              <p>
                لا تقلق على خصوصية صورك. على عكس أدوات ضغط الصور الأخرى التي
                ترفع صورك إلى خوادمها، أداتنا تعالج كل شيء محلياً في متصفحك.
                حتى الصور الحساسة — صور المنتجات، الصور الشخصية، لقطات الشاشة
                الخاصة — تبقى على جهازك فقط. لا توجد طريقة أكثر أماناً من ذلك.
              </p>
              <p>
                استخدم الأداة لتجهيز صور المواقع، تحسين صور المتجر الإلكتروني،
                تقليل حجم مرفقات البريد الإلكتروني، أو حتى لتوفير مساحة على
                هاتفك. الاحتمالات لا نهائية، والأداة مجانية للأبد.
              </p>
              <p className="text-center mt-8">
                <Link
                  href="/tools/image/compress-image"
                  className="inline-block rounded-xl bg-primary hover:bg-primary-dark px-8 py-3 text-lg font-bold text-white shadow-lg transition-all"
                >
                  📦 ابدأ ضغط صورك الآن
                </Link>
              </p>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary-dark text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">
              خفف صورك ووفّر مساحة — مجاناً!
            </h2>
            <p className="text-white/80 mb-6">
              قلل حجم الصور حتى 90% بضغطة زر. بدون رفع ملفات، بدون تسجيل.
            </p>
            <Link
              href="/tools/image/compress-image"
              className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-10 py-3 text-lg font-bold text-white shadow-lg transition-all"
            >
              ضغط الصور — ابدأ الآن
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
