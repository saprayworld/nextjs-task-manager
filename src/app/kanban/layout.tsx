import React from "react";
import { Navbar } from "@/components/kanban/Navbar";

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
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