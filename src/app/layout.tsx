import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplikasi Pengajuan Cuti",
  description:
    "Aplikasi web untuk mengajukan cuti bulanan beserta bukti dukung (PDF/JPG)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
