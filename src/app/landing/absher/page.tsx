import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "تصغير صورة أبشر 200×200 | أداة مجانية أونلاين | أدواتي",
  description:
    "أداة تصغير صورة أبشر أونلاين — حوّل صورتك إلى 200×200 بكسل لمنصة أبشر بضغطة زر. مجاني تماماً، بدون رفع للملفات، معالج في متصفحك.",
  alternates: { canonical: "https://adwati.com/landing/absher" },
  openGraph: {
    title: "تصغير صورة أبشر 200×200 | أداة مجانية أونلاين | أدواتي",
    description:
      "أداة تصغير صورة أبشر أونلاين — حوّل صورتك إلى 200×200 بكسل لمنصة أبشر بضغطة زر. مجاني تماماً، بدون رفع للملفات.",
    url: "https://adwati.com/landing/absher",
    locale: "ar_SA",
    type: "website",
    siteName: "أدواتي - Adwati",
  },
  twitter: {
    card: "summary_large_image",
    title: "تصغير صورة أبشر 200×200 | أداة مجانية أونلاين",
    description:
      "حوّل صورتك إلى 200×200 بكسل لمنصة أبشر بضغطة زر. مجاني، بدون رفع ملفات.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كيف أصغر صورة أبشر إلى 200×200؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "استخدم أداة تصغير صورة أبشر من أدواتي. ارفع صورتك (أو اسحبها) وستقوم الأداة تلقائياً بتغيير حجمها إلى 200×200 بكسل — المقاس المطلوب لمنصة أبشر. بعد التصغير يمكنك تحميل الصورة مباشرة. جميع المعالجات تتم في متصفحك بدون رفع للملفات.",
      },
    },
    {
      "@type": "Question",
      name: "ما هو المقاس المطلوب لصورة أبشر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "المقاس المطلوب لصورة أبشر هو 200×200 بكسل (عرض × ارتفاع). يجب أن تكون الصورة بصيغة JPG أو PNG وبحجم لا يتجاوز 100 كيلوبايت. أداتنا تضبط المقاس تلقائياً وتحافظ على جودة الصورة.",
      },
    },
    {
      "@type": "Question",
      name: "هل أداة تصغير صورة أبشر مجانية؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، أداة تصغير صورة أبشر مجانية تماماً ولا تتطلب أي تسجيل أو اشتراك. يمكنك استخدامها بقدر ما تشاء — بدون حدود. جميع المعالجات تتم محلياً في متصفحك.",
      },
    },
    {
      "@type": "Question",
      name: "هل يتم رفع صورتي إلى الإنترنت؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "لا، أبداً! صورتك لا تغادر جهازك. المعالجة تتم كاملة في المتصفح (Client-Side) باستخدام تقنيات HTML5 و Canvas. لا يتم إرسال أي بيانات إلى أي خادم.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي الصيغ المدعومة لتصغير صورة أبشر؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تدعم الأداة جميع صيغ الصور الشائعة: JPG، JPEG، PNG، WebP، BMP. يمكنك رفع صورتك بأي صيغة وستقوم الأداة بتصغيرها وإخراجها بصيغة متوافقة مع منصة أبشر.",
      },
    },
  ],
};

export default function AbsherLandingPage() {
  return (
    <>
      <Script
        id="faq-schema-absher"
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
            <div className="text-5xl mb-4">🛂</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              تصغير صورة أبشر — 200×200 بكسل
              <span className="block text-accent-light text-xl mt-2">
                أداة مجانية فورية بدون رفع للملفات
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
              تحتاج تصغير صورتك لمقاس أبشر؟ أداتنا تقوم بتغيير حجم الصورة
              تلقائياً إلى المقاس المطلوب 200×200 بكسل. فقط اسحب صورتك واترك
              الباقي علينا. مثالية لتجديد الهوية، إصدار الجواز، وتحديث البيانات
              في منصة أبشر.
            </p>
            <div className="mt-8">
              <Link
                href="/tools/image/absher-image"
                className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl"
              >
                🛂 جرب الأداة الآن — مجاناً
              </Link>
            </div>
          </div>
        </section>

        {/* Why This Tool */}
        <section className="py-16 bg-bg-card">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-text-main text-center mb-10">
              لماذا تحتاج أداة تصغير صورة أبشر؟
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-bg-main p-6">
                <h3 className="font-bold text-text-main text-lg mb-2">
                  ✅ مقاس مضبوط تلقائياً
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  لا حاجة لتخمين الأبعاد أو استخدام برامج معقدة. أداتنا تضبط
                  صورتك إلى 200×200 بكسل — المقاس المعتمد رسمياً في منصة أبشر
                  الإلكترونية التابعة لوزارة الداخلية السعودية.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-main p-6">
                <h3 className="font-bold text-text-main text-lg mb-2">
                  🔒 خصوصية تامة
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  صورتك الشخصية لا تغادر جهازك أبداً. كل المعالجة تتم داخل
                  متصفحك باستخدام تقنيات HTML5 المتقدمة. لا خوادم، لا رفع، لا
                  تخزين.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-main p-6">
                <h3 className="font-bold text-text-main text-lg mb-2">
                  ⚡ سرعة فائقة
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  لا انتظار لرفع الملفات ولا معالجة على السيرفر. بمجرد اختيار
                  صورتك تظهر النتيجة فوراً جاهزة للتحميل. وفر وقتك وجهدك.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-bg-main p-6">
                <h3 className="font-bold text-text-main text-lg mb-2">
                  🆓 مجاني تماماً
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  بدون تسجيل، بدون اشتراك، بدون علامات مائية. استخدم الأداة أي
                  وقت وبأي عدد من الصور — مجاناً للأبد.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-bg-main">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-text-main text-center mb-10">
              كيف تصغر صورتك لأبشر في ٣ خطوات
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "١",
                  title: "ارفع صورتك",
                  desc: "اسحب الصورة وأفلتها، أو اضغط للاختيار. كل الصيغ مدعومة.",
                },
                {
                  step: "٢",
                  title: "شاهد المعاينة",
                  desc: "ستظهر صورتك فوراً بمقاس 200×200، قارن مع الأصل.",
                },
                {
                  step: "٣",
                  title: "حمّل الصورة",
                  desc: "اضغط تحميل واحفظ الصورة الجديدة لرفعها في أبشر.",
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
                تصغير صورة أبشر: الحل الأسرع والأسهل
              </h2>
              <p>
                إذا كنت تبحث عن طريقة سهلة وسريعة لتصغير صورتك الشخصية لمقاس
                منصة أبشر، فأنت في المكان الصحيح. منصة أبشر تتطلب صوراً شخصية
                بمقاس محدد 200×200 بكسل، وهذا قد يكون مربكاً للكثيرين ممن لا
                يملكون خبرة في برامج تحرير الصور. مع أداتنا، كل ما تحتاجه هو
                صورتك الأصلية ونحن نتولى الباقي.
              </p>
              <p>
                أداتنا صُممت خصيصاً لتلبية متطلبات منصة أبشر — المنصة الوطنية
                الموحدة للخدمات الإلكترونية في المملكة العربية السعودية. سواء
                كنت تجدد بطاقة الهوية الوطنية، أو تصدر جواز سفر، أو تسجل في
                أحد الخدمات الحكومية، فإن صورتك يجب أن تكون بالمقاس الصحيح.
                أداتنا تضمن لك ذلك في ثوانٍ معدودة.
              </p>
              <p>
                الأهم من ذلك كله: خصوصيتك. الصورة الشخصية وثيقة حساسة، ونحن
                نتفهم ذلك تماماً. لهذا السبب صممنا أداتنا بحيث تعمل بالكامل في
                متصفحك. لا يتم إرسال صورتك إلى أي خادم خارجي، ولا يتم تخزينها،
                ولا يمكن لأحد غيرك الوصول إليها. معالجتك تبدأ وتنتهي على جهازك
                فقط.
              </p>
              <p className="text-center mt-8">
                <Link
                  href="/tools/image/absher-image"
                  className="inline-block rounded-xl bg-primary hover:bg-primary-dark px-8 py-3 text-lg font-bold text-white shadow-lg transition-all"
                >
                  🛂 ابدأ تصغير صورتك الآن
                </Link>
              </p>
            </article>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-12 bg-primary-dark text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">
              جاهز لتصغير صورتك لأبشر؟
            </h2>
            <p className="text-white/80 mb-6">
              أداة مجانية، خصوصية كاملة، نتيجة فورية. جربها الآن!
            </p>
            <Link
              href="/tools/image/absher-image"
              className="inline-block rounded-xl bg-accent hover:bg-accent-dark px-10 py-3 text-lg font-bold text-white shadow-lg transition-all"
            >
              تصغير صورة أبشر — ابدأ الآن
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
