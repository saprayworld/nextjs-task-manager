import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // <-- นำเข้า Provider
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow — Kanban Board จัดการงานที่ทันสมัย",
  description:
    "แอปจัดการงานแบบ Kanban Board ที่สร้างด้วย Next.js 16, shadcn/ui, Drizzle ORM และ Better Auth พร้อม Drag & Drop, Dark Mode และ Responsive Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning> 
    {/* ต้องใส่ suppressHydrationWarning ที่ html เพื่อไม่ให้ Next.js แจ้งเตือน Hydration Mismatch ตอนสลับตีม */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}