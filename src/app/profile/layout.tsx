import React from "react";
import { Navbar } from "@/components/kanban/Navbar";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Profile Settings | Project System",
  description: "Manage your profile and account settings.",
};

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  // ดึงข้อมูล Session จาก Request Headers ฝั่ง Server
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // ถ้าไม่มี Session (ยังไม่เข้าสู่ระบบ) ให้เด้งกลับไปหน้า Login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      {/* พื้นที่สำหรับ Render เนื้อหา (Page) */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
}
