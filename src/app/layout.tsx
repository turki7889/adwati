import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "أدواتي - Adwati | أدوات ويب عربية مجانية",
  description:
    "أدواتي - منصة الأدوات العربية المجانية. معالجة PDF، تحرير الصور، أدوات نصية وغيرها الكثير. جميع المعالجات تتم في المتصفح بأمان كامل.",
  keywords: [
    "أدوات ويب",
    "أدوات عربية",
    "معالجة PDF",
    "تحرير صور",
    "أدوات مجانية",
    "Adwati",
    "أدواتي",
  ],
  authors: [{ name: "Adwati" }],
  openGraph: {
    title: "أدواتي - Adwati | أدوات ويب عربية مجانية",
    description: "منصة الأدوات العربية المجانية - معالجة في المتصفح بأمان كامل",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased`}>{children}</body>
    </html>
  );
}
