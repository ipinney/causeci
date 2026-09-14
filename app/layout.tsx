import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CauseCI — Explain this GitHub Actions / CI failure",
    template: "%s · CauseCI",
  },
  description:
    "Paste a failing GitHub Actions or CI/CD log and get a ranked root-cause autopsy with confidence scores and concrete fix steps. Shareable HTML and Markdown artifact.",
  keywords: [
    "explain this GitHub Actions failure",
    "CI failure",
    "GitHub Actions",
    "root cause",
    "CI autopsy",
    "failing CI log",
  ],
  openGraph: {
    title: "CauseCI — Explain this GitHub Actions / CI failure",
    description:
      "Paste a red CI log. Get ranked root causes, confidence, and fix steps as a shareable artifact.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-coral focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
