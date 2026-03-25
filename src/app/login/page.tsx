"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, authClient, useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { checkEmailExists } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ป้องกันการ redirect ไปหน้า kanban ถ้ากำลังอยู่ในขั้นตอนตรวจสอบ OTP
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // ถ้ามี session อยู่แล้ว (ล็อกอินไว้แล้ว) ให้ redirect ไปหน้า kanban
  useEffect(() => {
    if (!isPending && session && !isAuthenticating && step === "credentials") {
      router.replace("/kanban");
    }
  }, [session, isPending, router, isAuthenticating, step]);

  // แสดง loading ระหว่างตรวจสอบ session แรกเริ่ม (ถ้ายังไม่เคยกดล็อกอิน)
  if (isPending || (session && !isAuthenticating && step === "credentials")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    // 1. ตรวจสอบว่าอีเมลมีในระบบหรือไม่
    const checkResult = await checkEmailExists(email);
    if (checkResult.error) {
      setError(checkResult.error);
      setLoading(false);
      setIsAuthenticating(false);
      return;
    }

    if (!checkResult.exists) {
      setError("ไม่มีอีเมลนี้ในระบบ โปรดตรวจสอบว่าคุณได้สมัครสมาชิกแล้ว");
      setLoading(false);
      setIsAuthenticating(false);
      return;
    }

    // 2. ส่ง OTP ไปที่อีเมลทันทีเพื่อเข้าสู่ระบบ
    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (otpError) {
      setError(otpError.message || "ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
      setIsAuthenticating(false);
      return;
    }

    setSuccessMsg("ส่งรหัส OTP ไปที่อีเมลแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ");
    setStep("otp");
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    // 4. เมื่อกรอกถูกต้อง จะถือว่าเข้าสู่ระบบสำเร็จ (สร้าง session ใหม่ด้วย OTP)
    const { data, error: apiError } = await signIn.emailOtp({
      email,
      otp,
    });

    if (apiError) {
      setError(apiError.message || "รหัส OTP ไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    // ล็อกอินสำเร็จ ให้พาไปหน้า board
    router.push("/kanban");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            {step === "credentials" ? "กรอกอีเมลเพื่อรับรหัสผ่านแบบใช้ครั้งเดียว (OTP)" : "กรอกรหัส OTP ที่ได้รับทางอีเมล"}
          </CardDescription>
        </CardHeader>

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังดำเนินการ..." : "ส่งรหัส OTP"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                  ไปหน้าสมัครสมาชิก
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                  {successMsg}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">รหัส OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังตรวจสอบ..." : "ยืนยันและเข้าสู่ระบบ"}
              </Button>
              <div className="gap-2 text-center text-sm text-muted-foreground flex justify-between px-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setSuccessMsg("");
                    setError("");
                    setOtp("");
                    setIsAuthenticating(false);
                  }}
                  className="underline underline-offset-4 hover:text-primary text-muted-foreground"
                >
                  ย้อนกลับไปเปลี่ยนบัญชี
                </button>
                -
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    setSuccessMsg("");
                    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
                      email,
                      type: "sign-in",
                    });
                    if (otpError) setError(otpError.message || "เกิดข้อผิดพลาด");
                    else setSuccessMsg("ส่งรหัส OTP ใหม่ไปที่อีเมลแล้ว");
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="underline underline-offset-4 hover:text-primary text-muted-foreground disabled:opacity-50"
                >
                  ขอรหัสใหม่
                </button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}