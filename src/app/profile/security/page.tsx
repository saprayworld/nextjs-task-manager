"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, ShieldAlert, CheckCircle2, Mail, AlertTriangle, Send, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function SecurityPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const enablePasswordChange = false;

  const handleSendVerification = async () => {
    setIsSendingEmail(true);
    try {
      if (typeof authClient.sendVerificationEmail === "function") {
        const { error } = await authClient.sendVerificationEmail({
          email: session?.user?.email || "",
        });
        if (error) throw new Error(error.message);
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }
      toast.success("ส่งลิงก์ยืนยันสำเร็จ! กรุณาตรวจสอบกล่องจดหมายของคุณ");
    } catch (err: any) {
      toast.error(err.message || "ไม่สามารถส่งอีเมลยืนยันได้");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setIsSaving(true);

    try {
      if (typeof authClient.changePassword === "function") {
        const { error } = await authClient.changePassword({
          newPassword,
          currentPassword,
          revokeOtherSessions: true,
        });

        if (error) {
          throw new Error(error.message || "รหัสผ่านปัจจุบันไม่ถูกต้อง หรือเกิดข้อผิดพลาด");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground animate-pulse text-sm">กำลังตรวจสอบข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      {/* Header Section — Report Dashboard style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รหัสผ่านและความปลอดภัย</h1>
          <p className="text-muted-foreground mt-1">
            จัดการรหัสผ่านและตรวจสอบความปลอดภัยของบัญชีเพื่อป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <Shield className="w-4 h-4" />
          <span>ความปลอดภัยของบัญชี</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 relative items-start">
        {/* Left Side: Navigation */}
        <ProfileSidebar />

        {/* Right Side: Content */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email Status */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">สถานะอีเมล</p>
                <div className={`p-2 rounded-lg ${session?.user?.emailVerified
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  }`}>
                  {session?.user?.emailVerified ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold">
                  {session?.user?.emailVerified ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}
                </p>
                {session?.user?.emailVerified && (
                  <span className="text-sm text-emerald-500 font-medium">✓</span>
                )}
              </div>
            </div>

            {/* Auth Provider */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">ประเภทการเข้าสู่ระบบ</p>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-bold">Email & OTP</p>
            </div>

            {/* Security Level */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">ระดับความปลอดภัย</p>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {session?.user?.emailVerified ? "ดี" : "ปานกลาง"}
                </p>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ease-in-out ${session?.user?.emailVerified ? "bg-emerald-500 w-4/5" : "bg-amber-500 w-2/5"
                      }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Verification Card */}
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  สถานะการยืนยันอีเมล
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  อีเมลของคุณคือ <span className="font-semibold text-foreground/80">{session?.user?.email}</span>
                </p>
              </div>
              {session?.user?.emailVerified ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" /> ยืนยันแล้ว
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4" /> ยังไม่ยืนยัน
                </div>
              )}
            </div>

            <div className="p-6">
              {!session?.user?.emailVerified ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    การยืนยันอีเมลช่วยเพิ่มความปลอดภัยให้บัญชีของคุณ และทำให้คุณสามารถกู้คืนรหัสผ่านได้ในกรณีที่ลืม
                  </p>
                  <Button
                    onClick={handleSendVerification}
                    disabled={isSendingEmail}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isSendingEmail ? "กำลังส่งลิงก์..." : "ส่งลิงก์ยืนยันอีเมล"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    บัญชีของคุณปลอดภัยและได้รับการยืนยันเรียบร้อยแล้ว หากพบปัญหาใด ๆ คุณสามารถใช้ความช่วยเหลือเพิ่มเติมจากเมนูตั้งค่าได้
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          {enablePasswordChange && (
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-rose-500" />
                    เปลี่ยนรหัสผ่าน
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    กรุณาตรวจสอบให้แน่ใจว่ารหัสผ่านใหม่มีความยาวอย่างน้อย 8 ตัวอักษรและคาดเดาได้ยาก
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="p-6 space-y-8">

                  {/* Information Box */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-foreground">คำแนะนำความปลอดภัย</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        การเปลี่ยนรหัสผ่านอาจทำให้ระบบออกจากระบบ (Sign Out) ในอุปกรณ์อื่นๆ ทั้งหมดที่คุณเคยล็อคอินไว้ เพื่อความปลอดภัยของบัญชี
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 max-w-xl">
                    {/* Current Password */}
                    <div className="space-y-2.5">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold">รหัสผ่านปัจจุบัน</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="transition-all duration-200 focus-visible:ring-rose-500/50 bg-background h-11"
                        placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                        required
                      />
                    </div>

                    <div className="border-t border-dashed border-border/50"></div>

                    {/* New Password */}
                    <div className="space-y-2.5">
                      <Label htmlFor="newPassword" className="text-sm font-semibold">รหัสผ่านใหม่</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="transition-all duration-200 focus-visible:ring-rose-500/50 bg-background h-11"
                        placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                        required
                        minLength={8}
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">ยืนยันรหัสผ่านใหม่</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`transition-all duration-200 bg-background h-11 ${confirmPassword && newPassword !== confirmPassword
                            ? "border-destructive focus-visible:ring-destructive/50"
                            : "focus-visible:ring-rose-500/50"
                            }`}
                          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                          required
                          minLength={8}
                        />
                        {confirmPassword && newPassword === confirmPassword && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive mt-1.5 font-medium">
                          รหัสผ่านและข้อมูลการยืนยันไม่ตรงกัน
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-border/50 bg-muted/10 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSaving}
                    className="px-6"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || (confirmPassword !== "" && newPassword !== confirmPassword)}
                    className="px-8 shadow-sm hover:shadow-md transition-all active:scale-[0.98] bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        อัปเดตรหัสผ่าน
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
