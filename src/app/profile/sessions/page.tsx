"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Laptop, LogOut, ShieldAlert, Globe, CalendarClock, Phone, MonitorSmartphone, Wifi } from "lucide-react";
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

  const currentSessionCount = sessions.filter(s => currentSessionData?.session?.id === s.id).length;
  const otherSessionCount = sessions.length - currentSessionCount;

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
      
      {/* Header Section — Report Dashboard style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">อุปกรณ์และเซสชัน</h1>
          <p className="text-muted-foreground mt-1">
            ตรวจสอบและจัดการอุปกรณ์ที่คุณใช้เข้าสู่ระบบอยู่ในปัจจุบัน
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <MonitorSmartphone className="w-4 h-4" />
          <span>{sessions.length} เซสชันที่ใช้งานอยู่</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 relative items-start">
        {/* Left Side: Navigation */}
        <ProfileSidebar />

        {/* Right Side: Content */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">เซสชันทั้งหมด</p>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Laptop className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{sessions.length}</h2>
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">อุปกรณ์ปัจจุบัน</p>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Wifi className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{currentSessionCount}</h2>
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">อุปกรณ์อื่น</p>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                  <MonitorSmartphone className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{otherSessionCount}</h2>
            </div>
          </div>

          {/* Sessions List — Report Dashboard card style */}
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-purple-500" />
                  เซสชันทั้งหมดที่ใช้งานอยู่
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  หากคุณพบอุปกรณ์ที่ไม่รู้จัก กรุณากด <b>ออกจากระบบ</b> และเปลี่ยนรหัสผ่าน
                </p>
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

            {/* Session Items */}
            <div className="divide-y divide-border/50">
              {isLoadingSessions ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">กำลังดึงข้อมูลเซสชันจากเซิร์ฟเวอร์...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Laptop className="w-12 h-12 mb-3 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium">ไม่พบอุปกรณ์ที่เข้าสู่ระบบ</h3>
                </div>
              ) : (
                sessions.map((sess) => {
                  const isCurrentSession = currentSessionData?.session?.id === sess.id;
                  const deviceType = getDeviceName(sess.userAgent);
                  const Icon = deviceType.includes("สมาร์ทโฟน") ? Phone : Laptop;

                  return (
                    <div 
                      key={sess.id} 
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg mt-0.5 shrink-0 ${
                          isCurrentSession 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <h3 className="text-base font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                            {deviceType}
                            {isCurrentSession && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold tracking-wider">
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
                })
              )}
            </div>

            {/* Footer Note */}
            <div className="px-6 py-4 border-t border-border/50 bg-muted/10 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                การคลิก "ออกจากระบบอุปกรณ์นี้" ระบบจะตัดการเชื่อมต่อทันที และอุปกรณ์ดังกล่าวจะต้องล็อคอินใหม่
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
