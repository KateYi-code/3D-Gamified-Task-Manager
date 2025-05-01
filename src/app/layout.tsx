import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planet App",
  description: "Interactive planet visualization application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-14 md:pt-16 pb-16 md:pb-0 min-h-screen">{children}</main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
