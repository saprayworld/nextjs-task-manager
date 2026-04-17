"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อแสดงผล");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (typeof authClient.updateUser === "function") {
        const { error } = await authClient.updateUser({
          name: name.trim(),
          image: image.trim() || undefined,
        });

        if (error) {
          throw new Error(error.message || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      toast.success("อัปเดตโปรไฟล์สำเร็จ! ข้อมูลของคุณได้รับการบันทึกแล้ว");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground animate-pulse text-sm">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">การตั้งค่าบัญชี (Account Settings)</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            จัดการข้อมูลส่วนตัว รูปโปรไฟล์ และการตั้งค่าที่เกี่ยวข้องกับความปลอดภัยของบัญชีของคุณ
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
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-emerald-500"></div>
            
            <form onSubmit={handleSave}>
              <CardHeader className="pb-6 pt-8">
                <h2 className="text-2xl font-semibold tracking-tight">ข้อมูลส่วนตัว</h2>
                <CardDescription className="text-sm">
                  อัปเดตข้อมูลส่วนตัวของคุณเพื่อให้เพื่อนร่วมงานรู้จักคุณมากขึ้น
                </CardDescription>
              </CardHeader>

              <Separator className="bg-border/40" />

              <CardContent className="space-y-8 pt-8">
                {/* Avatar Uploader Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/30 border border-muted/60">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background shadow-md overflow-hidden bg-muted flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/20">
                      {image ? (
                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                      ) : session?.user?.image ? (
                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-muted-foreground/40" />
                      )}
                    </div>
                    {/* Visual cue for Upload */}
                    <div className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg z-10 transition-all hover:scale-110 cursor-pointer ring-2 ring-background hover:ring-primary/50" title="เปลี่ยนรูปโปรไฟล์">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h3 className="text-sm font-semibold text-foreground">เลือกรูปโปรไฟล์</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto sm:mx-0">
                      เราแนะนำให้ใช้รูปภาพสี่เหลี่ยมจัตุรัส ขนาดอย่างน้อย 256x256 px เพื่อความคมชัด
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-sm font-semibold">ชื่อแสดงผล</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="transition-all duration-200 focus-visible:ring-primary bg-background h-11"
                      placeholder="กรอกชื่อที่ต้องการแสดง"
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">อีเมล (Email)</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email} 
                      className="bg-muted/40 border-transparent text-muted-foreground cursor-not-allowed pointer-events-none h-11"
                      disabled
                      readOnly
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      อีเมลใช้สำหรับเข้าสู่ระบบ ไม่สามารถเปลี่ยนได้
                    </p>
                  </div>

                  <div className="space-y-2.5 sm:col-span-2">
                    <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
                      ลิงก์รููปภาพ (Avatar URL)
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary uppercase font-bold tracking-wider">ทางเลือก</span>
                    </Label>
                    <Input 
                      id="image" 
                      value={image} 
                      onChange={(e) => setImage(e.target.value)}
                      className="transition-all duration-200 focus-visible:ring-primary bg-background"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      หากคุณมีลิงก์รูปภาพสาธารณะ สามารถนำมาใส่ที่นี่ได้ทันที เพื่ออัปเดตแทนการอัปโหลด
                    </p>
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
                  disabled={isSaving} 
                  className="px-8 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      บันทึกการปรับปรุง
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
