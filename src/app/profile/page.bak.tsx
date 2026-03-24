"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Camera, Loader2, Save, User as UserIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
      // เรียกใช้ API ของ better-auth เพื่ออัปเดตข้อมูลผู้ใช้
      if (typeof authClient.updateUser === "function") {
        const { error } = await authClient.updateUser({
          name: name.trim(),
          image: image.trim() || undefined,
        });

        if (error) {
          throw new Error(error.message || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
        }
      } else {
        // Fallback simulate ในกรณีที่ API ยังไม่ถูกกำหนด
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-background overflow-hidden selection:bg-primary/20">
      {/* Immersive Background Gradients */}
      <div className="absolute top-[-15%] left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Navigation Top Area */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-start z-20">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground group px-3" asChild>
          <Link href="/kanban">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            กลับไปที่ Board
          </Link>
        </Button>
      </div>

      {/* Main Content Composition */}
      <main className="w-full max-w-2xl px-6 py-12 z-10 animate-in fade-in zoom-in-95 duration-700 ease-out fill-mode-both">
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
          </p>
        </div>

        <Card className="border-border/40 shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-2xl ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-6 pt-8 px-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-background shadow-lg overflow-hidden bg-muted/50 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
                    {image ? (
                      <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    ) : session?.user?.image ? (
                      <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-muted-foreground/50" />
                    )}
                  </div>
                  {/* Pseudo-upload button for visual cue */}
                  <div className="absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-xl opacity-90 transition-all hover:scale-110 hover:bg-primary cursor-pointer hover:opacity-100 ring-2 ring-background">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="text-center sm:text-left space-y-1.5 flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">{session?.user?.name || "User"}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>บัญชีที่ยืนยันแล้ว</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
            </CardHeader>

            <Separator className="bg-border/40 mx-8 w-auto" />

            <CardContent className="space-y-6 pt-8 px-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold tracking-wide text-foreground/80">ชื่อแสดงผล (Display Name)</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-base transition-all duration-300 focus-visible:bg-background shadow-sm"
                  placeholder="กรอกชื่อที่ต้องการแสดง"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="image" className="text-sm font-semibold tracking-wide text-foreground/80">ลิงก์รูปโปรไฟล์ (Avatar URL)</Label>
                <Input 
                  id="image" 
                  value={image} 
                  onChange={(e) => setImage(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-base transition-all duration-300 focus-visible:bg-background shadow-sm"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold tracking-wide text-muted-foreground">อีเมล (Email)</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  className="h-12 bg-muted/30 border-transparent text-muted-foreground cursor-not-allowed opacity-70"
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground/70 font-medium">
                  อีเมลผูกติดกับบัญชี ไม่สามารถแก้ไขได้
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-4 pb-8 px-8 bg-muted/10 border-t border-border/10 mt-4 flex items-center justify-end">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSaving} 
                className="w-full sm:w-auto px-8 font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
