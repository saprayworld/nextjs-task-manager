"use client";

import React from "react";
import { LayoutDashboard, Search, Moon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onOpenCreateDialog: () => void;
}

export function Navbar({ onOpenCreateDialog }: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight leading-tight">Project Board</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">จัดการงานและโปรเจกต์ (Next.js + shadcn)</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ช่องค้นหา ซ่อนบนมือถือ, แสดงบนจอ Medium ขึ้นไป */}
        <div className="hidden md:flex relative items-center">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="ค้นหางาน..." 
            className="pl-9 pr-4 h-9 w-48 lg:w-64 bg-muted/50 border-transparent focus-visible:ring-primary transition-all"
          />
        </div>

        <div className="hidden sm:block w-px h-6 bg-border mx-1"></div>

        <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0" title="สลับโหมดสี">
          <Moon className="w-5 h-5" />
        </Button>
        
        {/* ปุ่มสร้างงาน ย่อขนาดและข้อความตามขนาดจอ */}
        <Button onClick={onOpenCreateDialog} className="flex items-center gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-sm font-medium shadow-sm shrink-0">
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">สร้างงานใหม่</span>
          <span className="inline sm:hidden">สร้าง</span>
        </Button>
      </div>
    </header>
  );
}