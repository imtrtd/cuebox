import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  JetBrains_Mono,
  Manrope,
  Space_Grotesk,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/AuthProvider";
import { LibraryProvider } from "@/lib/library-context";
import "./globals.css";
import "./brand.css";

// Shared display + mono voice with imtryingtodesign.com.
// Latin glyphs render in Space Grotesk / Geist Mono; Cyrillic falls back to
// Manrope / JetBrains Mono automatically (both cover the Cyrillic range).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${spaceGrotesk.variable} ${geistMono.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
