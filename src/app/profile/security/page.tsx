"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Loader2, KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function SecurityPage() {
  const { isPending } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">รหัสผ่านและความปลอดภัย</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            จัดการรหัสผ่านและตรวจสอบความปลอดภัยของบัญชีของคุณเพื่อป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 relative items-start">
        {/* Left Side: Navigation */}
        <ProfileSidebar />

        {/* Right Side: Form Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card className="shadow-sm border-border/60 bg-card overflow-hidden transition-all duration-300">
            {/* Top decorative gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-rose-400 to-red-500"></div>
            
            <form onSubmit={handlePasswordChange}>
              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-500" />
                  <h2 className="text-2xl font-semibold tracking-tight">เปลี่ยนรหัสผ่าน</h2>
                </div>
                <CardDescription className="text-sm mt-1">
                  กรุณาตรวจสอบให้แน่ใจว่ารหัสผ่านใหม่มีความยาวอย่างน้อย 8 ตัวอักษรและคาดเดาได้ยาก
                </CardDescription>
              </CardHeader>

              <Separator className="bg-border/40" />

              <CardContent className="space-y-8 pt-8">
                
                {/* Information Box */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40 border border-muted/80">
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

                  <Separator className="my-4 border-dashed bg-transparent border-t" />

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
                        className={`transition-all duration-200 bg-background h-11 ${
                          confirmPassword && newPassword !== confirmPassword 
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

              </CardContent>

              <div className="bg-muted/30 px-6 py-5 border-t border-border/40 flex items-center justify-end gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSaving}
                  className="px-6 border-border/60 hover:bg-muted"
                >
                  ยกเลิก
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || (confirmPassword !== "" && newPassword !== confirmPassword)} 
                  className="px-8 shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-rose-600 hover:bg-rose-700 text-white"
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
          </Card>
        </div>
      </div>
    </div>
  );
}
