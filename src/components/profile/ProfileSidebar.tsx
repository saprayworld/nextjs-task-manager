"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User as UserIcon, Lock, Laptop, ShieldCheck, AlertTriangle } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const navItems = [
  { href: "/profile", label: "โปรไฟล์ทั่วไป", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { href: "/profile/security", label: "รหัสผ่านและความปลอดภัย", icon: Lock, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  { href: "/profile/sessions", label: "อุปกรณ์และเซสชัน", icon: Laptop, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="md:col-span-4 lg:col-span-3 space-y-5 md:sticky top-6">
      {/* Navigation */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border/50 bg-muted/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">เมนูตั้งค่า</p>
        </div>
        <nav className="p-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <div className={`p-1.5 rounded-md ${isActive ? item.bg : "bg-muted/50"} transition-colors`}>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? item.color : "text-muted-foreground"} transition-colors`} />
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Email Verification Status Card */}
      {session?.user?.emailVerified ? (
        <div className="bg-card rounded-xl border border-emerald-500/20 shadow-sm overflow-hidden relative hidden md:block group transition-all hover:shadow-md">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-4 space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">ยืนยันอีเมลแล้ว</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              บัญชีของคุณมีความปลอดภัยและได้รับการปกป้องอย่างสมบูรณ์
            </p>
          </div>
        </div>
      ) : (
        <Link href="/profile/security" className="hidden md:block">
          <div className="bg-card rounded-xl border border-amber-500/30 shadow-sm overflow-hidden relative group transition-all hover:shadow-md cursor-pointer">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="p-4 space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">ยังไม่ยืนยันอีเมล</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                โปรดยืนยันที่อยู่อีเมลของคุณเพื่อเพิ่มความปลอดภัย{" "}
                <span className="text-amber-600 dark:text-amber-400 font-medium underline underline-offset-2">คลิกเพื่อยืนยัน</span>
              </p>
            </div>
          </div>
        </Link>
      )}
    </aside>
  );
}
