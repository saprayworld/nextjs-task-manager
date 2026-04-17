import React from "react";
import { Navbar } from "@/components/kanban/Navbar";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { generatePendingTasks } from "@/lib/services/recurring-generator";

export default async function KanbanLayout({ children }: { children: React.ReactNode }) {
  // ดึงข้อมูล Session จาก Request Headers ฝั่ง Server
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // ถ้าไม่มี Session (ยังไม่เข้าสู่ระบบ) ให้เด้งกลับไปหน้า Login
  if (!session) {
    redirect("/login");
  }

  // สร้าง recurring tasks ที่ค้างอยู่ (Lazy generation)
  await generatePendingTasks(session.user.id);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      {/* พื้นที่สำหรับ Render เนื้อหา (Page) */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}