"use client";

import React from "react";
import { LayoutDashboard, Search, Moon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/80 backdrop-blur-md shrink-0 z-10">
      
      {/* ฝั่งซ้าย: โลโก้ และ ชื่อโปรเจกต์ */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight leading-tight">Project System</h1>
        </div>
      </div>
      
      {/* ฝั่งขวา: ค้นหา -> เมนูนำทาง -> สลับธีม */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* 1. ช่องค้นหา (Desktop แสดง Input / Mobile แสดงแค่ Icon) */}
        <div className="hidden md:flex relative items-center">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="ค้นหางาน..." 
            className="pl-9 pr-4 h-9 w-48 lg:w-64 bg-muted/50 border-transparent focus-visible:ring-primary transition-all"
          />
        </div>
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground shrink-0" title="ค้นหา">
          <Search className="w-5 h-5" />
        </Button>

        {/* 2. เมนูนำทาง (ย้ายมาตรงนี้) */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button variant="ghost" size="sm" className="h-7 px-2 sm:px-3 text-xs bg-background shadow-sm">
            <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" /> 
            <span className="hidden sm:inline">Board</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 sm:px-3 text-xs text-muted-foreground hover:text-foreground">
            <List className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" /> 
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1"></div>
        
        {/* 3. ปุ่มสลับโหมดสี */}
        <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0" title="สลับโหมดสี">
          <Moon className="w-5 h-5" />
        </Button>
      </div>

    </header>
  );
}