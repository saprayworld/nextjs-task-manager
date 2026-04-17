"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, User as UserIcon, LogOut, Trash2, Archive, Loader2, ChartPie, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useTranslations } from "next-intl";

export function Navbar() {
  const pathname = usePathname(); // ใช้เช็คว่าอยู่หน้าไหน
  const router = useRouter();
  const { data: session } = useSession(); // ดึงข้อมูลผู้ใช้ปัจจุบัน
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const t = useTranslations("Navbar");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/80 backdrop-blur-md shrink-0 z-10">


        {/* ฝั่งซ้าย: โลโก้ และ ชื่อโปรเจกต์ */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg hidden md:block sm:text-xl font-semibold tracking-tight leading-tight">{t('title')}</h1>
          </div>
        </div>

        {/* ฝั่งขวา: ค้นหา -> เมนูนำทาง -> สลับธีม */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* 1. ช่องค้นหา (Global Search) */}
          {/* TODO: โดนซ่อนไว้ชั่วคราว รอทำระบบ Command Palette พร้อมฟีเจอร์ถังขยะในอนาคต */}
          {/* 
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
        */}

          {/* 2. เมนูนำทาง (อัปเดตเป็น Link และเช็ค Active Route) */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Link href="/kanban">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 sm:px-3 text-xs cursor-pointer ${pathname === '/kanban' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('links.board')}</span>
              </Button>
            </Link>
            <Link href="/kanban/list">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 sm:px-3 text-xs cursor-pointer ${pathname === '/kanban/list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('links.list')}</span>
              </Button>
            </Link>
            <Link href="/kanban/trash">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 sm:px-3 text-xs cursor-pointer ${pathname === '/kanban/trash' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('links.trash')}</span>
              </Button>
            </Link>
            <Link href="/kanban/archive">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 sm:px-3 text-xs cursor-pointer ${pathname === '/kanban/archive' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Archive className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('links.archive')}</span>
              </Button>
            </Link>
            <Link href="/kanban/recurring">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 sm:px-3 text-xs cursor-pointer ${pathname === '/kanban/recurring' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">{t('links.recurring')}</span>
              </Button>
            </Link>
          </div>

          <div className="w-px h-6 bg-border mx-1"></div>

          {/* 3. ปุ่มสลับโหมดสี และ สลับภาษา */}
          <ThemeToggle />
          <LanguageSwitcher />

          {/* 4. เมนูโปรไฟล์ผู้ใช้และปุ่มออกจากระบบ */}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 ml-1 cursor-pointer relative overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt="User profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">
                    <UserIcon className="w-4 h-4 mr-2" />
                    {t('userMenu.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/kanban/report">
                    <ChartPie className="w-4 h-4 mr-2" />
                    {t('userMenu.report')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault(); // ป้องกันไม่ให้ Dropdown ปิดทันทีเพื่อให้ผู้ใช้เห็นสถานะ Loading
                    handleLogout();
                  }}
                  className="text-destructive cursor-pointer data-[disabled]:opacity-50"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {isLoggingOut ? t('userMenu.loggingOut') : t('userMenu.logout')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsAboutOpen(true)} className="cursor-pointer">
                  <Info className="w-4 h-4 mr-2" />
                  เกี่ยวกับ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

      </header>

      {/* About Dialog */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              About
            </DialogTitle>
            <DialogDescription>
              Details and version information of the system
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-0 py-2">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Project Name</span>
              <span className="text-sm font-semibold tracking-tight">TaskFlow (sapray-nextjs-task-manager)</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Version</span>
              <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">pre-release</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Environment</span>
              <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                {process.env.VERCEL_ENV || process.env.NODE_ENV}
              </span>
            </div>
            {/* <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">วันที่อัปเดตล่าสุด</span>
              <span className="text-sm">TEST</span>
            </div> */}
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Git Hash</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  #{process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <div className="bg-muted/40 p-3 rounded-lg text-xs text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} Saprayworld. All rights reserved.
            </div>
            <Button className="w-full" variant="outline" onClick={() => setIsAboutOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}