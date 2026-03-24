"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Lock, Mail, ShieldCheck, Laptop, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

export function ProfileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
      </nav>

      {session?.user?.emailVerified ? (
        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm overflow-hidden relative hidden md:block group transition-all hover:bg-emerald-500/10">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <CardHeader className="pb-3 z-10 relative">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm text-emerald-700 dark:text-emerald-300">ยืนยันอีเมลแล้ว</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="z-10 relative">
            <p className="text-xs text-muted-foreground leading-relaxed">
              บัญชีของคุณมีความปลอดภัยและได้รับการปกป้องอย่างสมบูรณ์
            </p>
          </CardContent>
        </Card>
      ) : (
        <Link href="/profile/security" className="block hidden md:block">
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm overflow-hidden relative group transition-all hover:bg-amber-500/10 cursor-pointer">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <CardHeader className="pb-3 z-10 relative">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-sm text-amber-700 dark:text-amber-300">ยังไม่ยืนยันอีเมล</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="z-10 relative">
              <p className="text-xs text-muted-foreground leading-relaxed">
                โปรดยืนยันที่อยู่อีเมลของคุณเพื่อเพิ่มความปลอดภัยให้บัญชีสุดสุด <span className="text-amber-600 dark:text-amber-400 font-medium underline underline-offset-2">คลิกเพื่อยืนยัน</span>
              </p>
            </CardContent>
          </Card>
        </Link>
      )}
    </aside>
  );
}
