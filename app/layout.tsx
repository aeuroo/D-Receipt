import type { Metadata } from "next";
import { Sarabun } from "next/font/google";

import { AppNav } from "@/components/layout/AppNav";
import { Providers } from "@/components/providers/Providers";

import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "Receipt Print | ระบบพิมพ์ใบเสร็จ",
  description:
    "สร้างและพิมพ์ใบเสร็จ ใบเสนอราคา และใบแจ้งหนี้ พร้อมบันทึกและดาวน์โหลด PDF",
  icons: {
    icon: "/receipt.png",
    apple: "/receipt.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full`}>
      <body className="mesh-bg min-h-full antialiased">
        <Providers>
          <AppNav />
          <main className="pt-[max(1.75rem,env(safe-area-inset-top,0px))] pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] sm:pt-0 sm:pb-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
