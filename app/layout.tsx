import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import { site } from "@/content/site";
import { GA_ID } from "@/lib/analytics";
import "./globals.css";

const body = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    url: "/",
    siteName: site.name,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "z5LWcnw5Qg4zG6vz7hqCifcM-9Vpyjy29zF5soxcilI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${body.variable} ${display.variable}`}>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-text antialiased">{children}</body>
    </html>
  );
}
