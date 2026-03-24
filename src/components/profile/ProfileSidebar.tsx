"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Lock, Mail, ShieldCheck, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="md:col-span-4 lg:col-span-3 space-y-6 md:sticky top-6">
      <nav className="flex flex-col gap-2">
        <Button variant={pathname === "/profile" ? "secondary" : "ghost"} className={`justify-start gap-3 w-full font-medium ${pathname !== "/profile" ? "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" : ""}`} size="lg" asChild>
          <Link href="/profile">
            <UserIcon className="w-4 h-4" /> โปรไฟล์ทั่วไป
          </Link>
        </Button>
        <Button variant={pathname === "/profile/security" ? "secondary" : "ghost"} className={`justify-start gap-3 w-full font-medium ${pathname !== "/profile/security" ? "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" : ""}`} size="lg" asChild>
          <Link href="/profile/security">
            <Lock className="w-4 h-4" /> รหัสผ่านและความปลอดภัย
          </Link>
        </Button>
        <Button variant={pathname === "/profile/sessions" ? "secondary" : "ghost"} className={`justify-start gap-3 w-full font-medium ${pathname !== "/profile/sessions" ? "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" : ""}`} size="lg" asChild>
          <Link href="/profile/sessions">
            <Laptop className="w-4 h-4" /> อุปกรณ์และเซสชัน
          </Link>
        </Button>
        <Button variant={pathname === "/profile/notifications" ? "secondary" : "ghost"} className={`justify-start gap-3 w-full font-medium ${pathname !== "/profile/notifications" ? "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" : ""}`} size="lg" asChild>
          <Link href="/profile/notifications">
            <Mail className="w-4 h-4" /> การแจ้งเตือน
          </Link>
        </Button>
      </nav>
      
      <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm overflow-hidden relative hidden md:block">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <CardHeader className="pb-3 z-10 relative">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-sm text-emerald-700 dark:text-emerald-300">ยืนยันตัวตนแล้ว</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="z-10 relative">
          <p className="text-xs text-muted-foreground leading-relaxed">
            บัญชีของคุณได้รับการยืนยันและปกป้องด้วยมาตรฐานความปลอดภัยสูง ข้อมูลส่วนตัวของคุณจะถูกเก็บรักษาเป็นความลับ
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
