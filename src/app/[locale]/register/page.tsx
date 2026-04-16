"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { checkEmailExists } from "@/app/[locale]/login/actions"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ถ้ามี session อยู่แล้ว (ล็อกอินไว้แล้ว) ให้ redirect ไปหน้า kanban
  useEffect(() => {
    if (!isPending && session) {
      router.replace("/kanban");
    }
  }, [session, isPending, router]);

  // แสดง loading ระหว่างตรวจสอบ session
  if (isPending || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    // 1. ตรวจสอบว่าระบบมีอีเมลนี้อยู่แล้วหรือไม่
    const checkResult = await checkEmailExists(email);
    if (checkResult.error) {
      setError(checkResult.error);
      setLoading(false);
      return;
    }

    if (checkResult.exists) {
      setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาไปหน้าเข้าสู่ระบบ");
      setLoading(false);
      return;
    }

    // 2. สุ่มรหัสผ่านหลังบ้าน (Auto-generated Password)
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();

    // 3. เรียกใช้ signUp จาก Better Auth SDK
    const { data, error } = await signUp.email({
      email,
      password: randomPassword,
      name,
    });

    if (error) {
      setError(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      setLoading(false);
      return;
    }

    // แจ้งเตือนให้ไปยืนยันอีเมล
    setSuccessMsg("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบกล่องจดหมายอีเมลของคุณเพื่อยืนยันบัญชี");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">สร้างบัญชีใหม่</CardTitle>
          <CardDescription>กรอกข้อมูลด้านล่างเพื่อสมัครสมาชิก</CardDescription>
        </CardHeader>

        {successMsg ? (
          <CardContent className="space-y-4 py-8">
            <div className="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md text-center flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>{successMsg}</span>
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => router.push("/login")}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "กำลังดำเนินการ..." : "สมัครสมาชิก"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}