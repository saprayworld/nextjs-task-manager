"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Laptop, LogOut, ShieldAlert, Globe, CalendarClock, Phone } from "lucide-react";
import { toast } from "sonner";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

type ActiveSession = {
  id: string;
  token?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  expiresAt: string | Date;
};

export default function SessionsPage() {
  const { data: currentSessionData, isPending } = useSession();
  
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && currentSessionData) {
      fetchSessions();
    }
  }, [currentSessionData, isPending]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      if (typeof authClient.listSessions === "function") {
        const { data, error } = await authClient.listSessions();
        if (error) {
          throw new Error(error.message || "Failed to fetch sessions");
        }
        if (data) {
          // Handle both forms of better auth list sessions response just in case
          const parsedSessions = data.map((item: any) => {
            if (item.session) return item.session;
            return item;
          });
          setSessions(parsedSessions);
        }
      } else {
        // Fallback for cases where standard method isn't loaded or configured
        if (currentSessionData?.session) {
           setSessions([currentSessionData.session as any]);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("ไม่สามารถดึงข้อมูลอุปกรณ์ที่เข้าสู่ระบบได้");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevoke = async (sessionToRevoke: ActiveSession) => {
    setRevokingId(sessionToRevoke.id);
    try {
      if (typeof authClient.revokeSession === "function") {
        const tokenToRevoke = sessionToRevoke.token || sessionToRevoke.id;
        const { error } = await authClient.revokeSession({ token: tokenToRevoke });
        if (error) throw new Error(error.message);
      } else {
        await new Promise(res => setTimeout(res, 800));
      }
      
      toast.success("ลบเซสชันออกจากระบบเรียบร้อยแล้ว");
      setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke.id));
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการนำออกเซสชัน");
    } finally {
      setRevokingId(null);
    }
  };

  // Helper เพื่อดึงชื่ออุปกรณ์จาก userAgent
  const getDeviceName = (userAgent?: string | null) => {
    if (!userAgent) return "อุปกรณ์ที่ไม่รู้จัก (Unknown Device)";
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) return "สมาร์ทโฟน (Mobile Device)";
    if (userAgent.includes("Mac") || userAgent.includes("Windows") || userAgent.includes("Linux")) return "คอมพิวเตอร์ (Desktop/Laptop)";
    return "อุปกรณ์ Browser";
  };

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  if (isPending) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground animate-pulse text-sm">กำลังตรวจสอบข้อมูลเซสชัน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">อุปกรณ์และเซสชัน (Sessions)</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            ตรวจสอบและจัดการอุปกรณ์ที่คุณใช้เข้าสู่ระบบ (Sign In) อยู่ในปัจจุบัน 
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 relative items-start">
        {/* Left Side: Navigation */}
        <ProfileSidebar />

        {/* Right Side: Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card className="shadow-sm border-border/60 bg-card overflow-hidden transition-all duration-300">
            {/* Top decorative gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500"></div>
            
            <CardHeader className="pb-6 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-2xl font-semibold tracking-tight">เซสชันทั้งหมดที่ใช้งานอยู่</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={fetchSessions}
                  disabled={isLoadingSessions}
                >
                  {isLoadingSessions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  รีเฟรชข้อมูล
                </Button>
              </div>
              <CardDescription className="text-sm mt-1">
                หากคุณพบอุปกรณ์ที่ไม่รู้จัก กรุณากดปุ่ม <b>ออกจากระบบ</b> และเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี
              </CardDescription>
            </CardHeader>

            <Separator className="bg-border/40" />

            <CardContent className="space-y-6 pt-8">
              {isLoadingSessions ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">กำลังดึงข้อมูลเซสชันจากเซิร์ฟเวอร์...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-muted/20 border-dashed">
                  <Laptop className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">ไม่พบอุปกรณ์ที่เข้าสู่ระบบ</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((sess) => {
                    const isCurrentSession = currentSessionData?.session?.id === sess.id;
                    const deviceType = getDeviceName(sess.userAgent);
                    const Icon = deviceType.includes("สมาร์ทโฟน") ? Phone : Laptop;

                    return (
                      <div 
                        key={sess.id} 
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border transition-all duration-200 ${
                          isCurrentSession 
                            ? "bg-indigo-50/50 border-indigo-200/60 dark:bg-indigo-950/20 dark:border-indigo-800/60" 
                            : "bg-card border-border hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full mt-1 shrink-0 ${isCurrentSession ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="space-y-1.5">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                              {deviceType}
                              {isCurrentSession && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold tracking-wider">
                                  อุปกรณ์ปัจจุบัน
                                </span>
                              )}
                            </h3>
                            
                            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 text-xs text-muted-foreground">
                              {sess.ipAddress && (
                                <span className="flex items-center gap-1.5 line-clamp-1 break-all">
                                  <Globe className="w-3.5 h-3.5 shrink-0" />
                                  IP: {sess.ipAddress}
                                </span>
                              )}
                              {sess.createdAt && (
                                <span className="flex items-center gap-1.5 shrink-0">
                                  <CalendarClock className="w-3.5 h-3.5" />
                                  ลงชื่อเข้าใช้: {formatDate(sess.createdAt)}
                                </span>
                              )}
                            </div>

                            {sess.userAgent && (
                              <div className="text-[11px] text-muted-foreground/70 line-clamp-1 pt-1 break-all max-w-[300px] lg:max-w-md">
                                {sess.userAgent}
                              </div>
                            )}
                          </div>
                        </div>

                        {!isCurrentSession && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full sm:w-auto text-destructive border-transparent hover:border-destructive/20 hover:bg-destructive/10 shrink-0"
                            disabled={revokingId === sess.id}
                            onClick={() => handleRevoke(sess)}
                          >
                            {revokingId === sess.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <LogOut className="w-4 h-4 mr-2" />
                            )}
                            ออกจากระบบอุปกรณ์นี้
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            <div className="bg-muted/20 px-6 py-4 border-t border-border/40 mt-2 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                การคลิก "ออกจากระบบอุปกรณ์นี้" ระบบจะตัดการเชื่อมต่อทันที และอุปกรณ์ดังกล่าวจะต้องล็อคอินใหม่
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
