import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/AuthProvider";
import { LibraryProvider } from "@/lib/library-context";
import "./globals.css";
import "./brand.css";

// Display: Space Grotesk (wordmark, numerals, latin UI), shared with imtrtd.space.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Text: Onest — neutral grotesque with full Cyrillic for the Russian UI.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Cuebox — AI working library",
    template: "%s — Cuebox",
  },
  description:
    "Рабочее пространство для промптов, чатов, переменных и повторяемых AI-сценариев.",
  applicationName: "Cuebox",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0b10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${spaceGrotesk.variable} ${onest.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <LibraryProvider>{children}</LibraryProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
