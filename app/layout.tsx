import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-label",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEK Studios — Own The Streets",
    template: "%s · NEK Studios",
  },
  description:
    "Heavyweight waffle-structure cotton tees, cut for movement. Collection '26 — printed in small runs, sold until the sizes run out.",
  openGraph: {
    title: "NEK Studios — Own The Streets",
    description:
      "Heavyweight waffle-structure cotton tees, cut for movement. Collection '26.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
