import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// แปลง Handler ของ Better Auth ให้ทำงานร่วมกับ Next.js App Router ได้
export const { GET, POST } = toNextJsHandler(auth);