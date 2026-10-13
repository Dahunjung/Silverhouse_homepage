import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { company } from "@/lib/company";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const description = `${company.name}는 모바일 애플리케이션을 개발하는 회사입니다.`;
const metadataBase = getSiteUrl();

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: `${company.name} — ${company.business.ko}`,
    template: `%s · ${company.name}`,
  },
  description,
  applicationName: company.name,
  authors: [{ name: company.name }],
  openGraph: {
    title: company.name,
    description,
    locale: "ko_KR",
    type: "website",
    siteName: company.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <Header />
        <main id="content">{children}</main>
        <Footer />
        <JsonLd />
      </body>
    </html>
  );
}
