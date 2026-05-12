import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ComponentProvider } from "@/lib/component-store";
import { UserPreferencesProvider } from "@/lib/user-preferences";
import Navbar from "@/components/Navbar";
import PreviewWarmer from "@/components/PreviewWarmer";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegitUI - Free & Open Source React Components",
  description:
    "A beautifully crafted collection of free, open-source React components for creative developers. Copy, paste, and ship faster.",
  keywords: ["react", "components", "ui", "open source", "free", "animations", "tailwind"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className={styles.body}>
        <ComponentProvider>
          <UserPreferencesProvider>
            <Navbar />
            <main className={styles.main}>{children}</main>
            <PreviewWarmer />
          </UserPreferencesProvider>
        </ComponentProvider>
      </body>
    </html>
  );
}

