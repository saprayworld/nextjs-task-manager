"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Search, List, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const pathname = usePathname(); // ใช้เช็คว่าอยู่หน้าไหน
  const router = useRouter();
  const { data: session } = useSession(); // ดึงข้อมูลผู้ใช้ปัจจุบัน

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

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

        {/* 1. ช่องค้นหา */}
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

        {/* 2. เมนูนำทาง (อัปเดตเป็น Link และเช็ค Active Route) */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Link href="/kanban">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 sm:px-3 text-xs ${pathname === '/kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Board</span>
            </Button>
          </Link>
          <Link href="/kanban/list">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 sm:px-3 text-xs ${pathname === '/kanban/list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </Link>
        </div>

        <div className="w-px h-6 bg-border mx-1"></div>

        {/* 3. ปุ่มสลับโหมดสี */}
        <ThemeToggle />

        {/* 4. เมนูโปรไฟล์ผู้ใช้และปุ่มออกจากระบบ */}
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 ml-1">
                <UserIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

    </header>
  );
}