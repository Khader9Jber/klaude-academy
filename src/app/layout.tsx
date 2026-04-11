import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteHeader, SiteFooter } from "@/components/layout";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Klaude Academy",
    template: "%s | Klaude Academy",
  },
  description:
    "Master Claude from zero to hero. A free, comprehensive learning path covering everything from AI fundamentals to advanced agent workflows.",
  metadataBase: new URL("https://klaude-academy.netlify.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Klaude Academy",
    title: "Klaude Academy — Master Claude from Zero to Hero",
    description:
      "A free, comprehensive learning path with 74 lessons across 13 modules. Learn AI fundamentals, prompt engineering, Claude Code, and advanced agent workflows.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Klaude Academy — Master Claude from Zero to Hero",
    description:
      "A free, comprehensive learning path with 74 lessons across 13 modules.",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "Claude",
    "Claude Code",
    "Anthropic",
    "AI",
    "prompt engineering",
    "LLM",
    "learning",
    "tutorial",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Klaude Academy",
              url: "https://klaude-academy.netlify.app",
              description:
                "A free, comprehensive learning path for mastering Claude and Claude Code.",
              publisher: {
                "@type": "Organization",
                name: "Klaude Academy",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-background focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <SiteHeader />
            <main id="main-content" className="flex-1">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
