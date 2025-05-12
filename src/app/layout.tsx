import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Planet App",
  description: "Interactive planet visualization application",
  generator: "Next.js",
  manifest: "/pwa/manifest.json",
  // themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  // authors: [{ name: "David" }],
  icons: [{ rel: "icon", url: "pwa/favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="manifest" href="/pwa/manifest.json" />
      <body className="max-h-screen min-h-screen bg-gray-50">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-14 md:pt-16 pb-16 md:pb-0 h-screen flex flex-col">{children}</main>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
