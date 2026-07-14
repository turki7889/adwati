import { MetadataRoute } from "next";
import { tools, categories } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://adwati.com";
  const lastModified = new Date();

  // الصفحة الرئيسية
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // صفحات الفئات
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/tools/${cat.id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // صفحات الأدوات
  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}${tool.route}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // صفحات الهبوط SEO
  const landingRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/landing/absher`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/landing/compress`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/landing/pdf`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...landingRoutes];
}
