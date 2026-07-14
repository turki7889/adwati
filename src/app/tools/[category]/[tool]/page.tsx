import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToolById, getCategoryById, tools as allTools } from "@/lib/tools";
import dynamic from "next/dynamic";

export async function generateStaticParams() {
  return allTools.map((tool) => ({
    category: tool.category,
    tool: tool.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; tool: string };
}): Promise<Metadata> {
  const tool = getToolById(params.tool);

  if (!tool) {
    return {
      title: "الأداة غير موجودة | أدواتي",
      description: "عذراً، الأداة التي تبحث عنها غير موجودة.",
    };
  }

  const title = `${tool.nameAr} | أدواتي - Adwati`;
  const description = `${tool.descriptionAr} — أداة مجانية تعمل بالكامل في متصفحك بدون رفع للملفات.`;
  const url = `https://adwati.com${tool.route}`;

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

// Map tool IDs to their components
const toolComponents: Record<string, React.ComponentType> = {
  "convert-image": dynamic(() => import("@/components/tools/convert-image"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "compress-image": dynamic(() => import("@/components/tools/compress-image"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "resize-image": dynamic(() => import("@/components/tools/resize-image"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "crop-image": dynamic(() => import("@/components/tools/crop-image"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "filter-image": dynamic(() => import("@/components/tools/filter-image"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "favicon-generator": dynamic(() => import("@/components/tools/favicon-generator"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "absher-image": dynamic(() => import("@/components/tools/absher-image"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "merge-pdf": dynamic(() => import("@/components/tools/merge-pdf"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "split-pdf": dynamic(() => import("@/components/tools/split-pdf"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "images-to-pdf": dynamic(() => import("@/components/tools/images-to-pdf"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "protect-pdf": dynamic(() => import("@/components/tools/protect-pdf"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "convert-audio": dynamic(() => import("@/components/tools/convert-audio"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "extract-signature": dynamic(() => import("@/components/tools/extract-signature"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
  "draw-signature": dynamic(() => import("@/components/tools/draw-signature"), {
    ssr: false,
    loading: () => <ToolLoading />,
  }),
};

function ToolLoading() {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
      <div className="animate-spin inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-4" />
      <p className="text-lg text-text-muted">جاري تحميل الأداة...</p>
    </div>
  );
}

export default function ToolPage({
  params,
}: {
  params: { category: string; tool: string };
}) {
  const tool = getToolById(params.tool);

  if (!tool) {
    notFound();
  }

  const category = getCategoryById(tool.category);
  const ToolComponent = toolComponents[params.tool];

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
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-primary transition-colors">
            الأدوات
          </Link>
          <span>/</span>
          <Link
            href={`/tools/${tool.category}`}
            className="hover:text-primary transition-colors"
          >
            {category?.nameAr}
          </Link>
          <span>/</span>
          <span className="text-text-main font-medium">{tool.nameAr}</span>
        </nav>
      </div>

      {/* Tool Header */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-bg text-primary rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
            {tool.icon}
          </div>
          <h1 className="text-3xl font-bold text-text-main">
            {tool.nameAr}
          </h1>
          <p className="mt-2 text-lg text-text-secondary">{tool.descriptionAr}</p>
          <span className="mt-3 inline-block rounded-full bg-primary-bg text-primary px-4 py-1 text-sm font-medium">
            {category?.nameAr}
          </span>
        </div>

        {/* Tool Workspace - Real Component */}
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border bg-bg-main p-12 text-center">
            <div className="text-5xl mb-4 opacity-30">{tool.icon}</div>
            <p className="text-lg text-text-muted mb-2">
              أداة {tool.nameAr} قيد التطوير
            </p>
            <p className="text-sm text-text-muted">
              سيتم تفعيل هذه الأداة قريباً — المعالجة ستتم بالكامل في متصفحك
            </p>
          </div>
        )}

        {/* Related Tools */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-text-main mb-4">
            أدوات مشابهة
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tools/${tool.category}`}
              className="rounded-lg bg-bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:bg-primary-bg hover:text-primary transition-colors"
            >
              جميع أدوات {category?.nameAr}
            </Link>
          </div>
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
