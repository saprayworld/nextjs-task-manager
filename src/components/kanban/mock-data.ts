import { Task, Tag } from "./kanban-board";
import { BoardColumn } from "./TaskDialog";

export const getTodayDate = () => new Date().toISOString().split('T')[0];
export const getOffsetDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ==========================================
// หมวดหมู่และ Tags (เพื่อให้เรียกใช้ง่ายๆ)
// ==========================================
export const tags: Record<string, Tag> = {
  default: { text: "Default", classes: "text-gray-600 bg-gray-50 dark:bg-gray-900/30 dark:text-gray-400" },
  design: { text: "Design", classes: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
  development: { text: "Development", classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
  research: { text: "Research", classes: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
  marketing: { text: "Marketing", classes: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
  wr: { text: "Work Request", classes: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" },
  pm: { text: "PM", classes: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" },
  cm: { text: "CM", classes: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-400" },
};

// ==========================================
// ข้อมูลคอลัมน์ (สถานะ)
// ==========================================
export const mockColumns: BoardColumn[] = [
  { id: "todo", title: "To Do", dotColor: "bg-muted-foreground" },
  { id: "inprogress", title: "In Progress", dotColor: "bg-primary animate-pulse" },
  { id: "review", title: "Review", dotColor: "bg-amber-400" },
  { id: "done", title: "Done", dotColor: "bg-emerald-500" },
];

// ==========================================
// ข้อมูลงานจำลอง (Tasks) - เพิ่มจำนวนให้เห็น Pagination ชัดๆ
// ==========================================
export const mockTasks: Task[] = [
  {
    id: "1", columnId: "todo", categoryId: "design", tag: tags.design,
    title: "ออกแบบ UI หน้า About Us",
    description: "จัดวางโครงสร้างหน้าเพจใหม่ให้เข้ากับธีมของธุรกิจ เน้นความเรียบหรู",
    avatars: ["https://i.pravatar.cc/150?img=11", "https://i.pravatar.cc/150?img=32"],
    attachments: 2, comments: 4, dueDate: getOffsetDate(5)
  },
  {
    id: "2", columnId: "todo", categoryId: "research", tag: tags.research,
    title: "วิเคราะห์คู่แข่งในตลาด",
    description: "รวบรวมข้อมูลฟีเจอร์เด่นๆ ของระบบจัดการโปรเจกต์ 3 เจ้าหลัก",
    initials: "JS", dueDate: getTodayDate(), dueDateClasses: "text-destructive bg-destructive/10"
  },
  {
    id: "3", columnId: "inprogress", categoryId: "development", tag: tags.development,
    title: "พัฒนาระบบ Drag & Drop",
    description: "เขียนสคริปต์ให้สามารถย้ายการ์ดข้ามคอลัมน์ได้ด้วย dnd-kit",
    progress: 65, avatars: ["https://i.pravatar.cc/150?img=33"], comments: 1
  },
  {
    id: "4", columnId: "review", categoryId: "marketing", tag: tags.marketing,
    title: "ทำ A/B Testing หน้า Landing Page",
    description: "ทดสอบการวางปุ่ม Call to Action สองรูปแบบเพื่อดู Conversion Rate",
    initials: "MR", progress: 90, comments: 8, dueDate: getOffsetDate(-1), dueDateClasses: "text-destructive font-semibold"
  },
  {
    id: "5", columnId: "done", categoryId: "design", tag: tags.design,
    title: "ออกแบบ Logo สำหรับแคมเปญใหม่",
    description: "เสร็จสิ้นการออกแบบและส่งมอบไฟล์ Vector ให้ทีม Marketing",
    avatars: ["https://i.pravatar.cc/150?img=47"], progress: 100
  },
  {
    id: "6", columnId: "todo", categoryId: "development", tag: tags.development,
    title: "แก้ไข Bug หน้า Login",
    description: "ผู้ใช้บางรายรายงานว่าไม่สามารถ Login ผ่าน Google ได้บน Safari",
    attachments: 1, dueDate: getTodayDate()
  },
  {
    id: "7", columnId: "inprogress", categoryId: "research", tag: tags.research,
    title: "สัมภาษณ์ผู้ใช้งาน (User Interview)",
    description: "เตรียมชุดคำถามและนัดสัมภาษณ์กลุ่มตัวอย่าง 5 คนในสัปดาห์นี้",
    progress: 40, initials: "TK", comments: 2, dueDate: getOffsetDate(2)
  },
  {
    id: "8", columnId: "review", categoryId: "development", tag: tags.development,
    title: "ปรับปรุงความเร็วในการโหลดเว็บ",
    description: "Optimize รูปภาพและทำ Code Splitting ในส่วนของหน้าแรก",
    avatars: ["https://i.pravatar.cc/150?img=12", "https://i.pravatar.cc/150?img=14"], progress: 95
  },
  {
    id: "9", columnId: "done", categoryId: "marketing", tag: tags.marketing,
    title: "ตั้งค่าแคมเปญโฆษณา Facebook",
    description: "ตั้งค่ากลุ่มเป้าหมายและงบประมาณสำหรับไตรมาสที่ 3",
    progress: 100, attachments: 3, comments: 5
  },
  {
    id: "10", columnId: "todo", categoryId: "design", tag: tags.design,
    title: "ปรับปรุง UX หน้าชำระเงิน",
    description: "ลดขั้นตอนการกรอกข้อมูลและเพิ่มช่องทาง Apple Pay",
    avatars: ["https://i.pravatar.cc/150?img=5"], dueDate: getOffsetDate(10)
  },
  {
    id: "11", columnId: "inprogress", categoryId: "development", tag: tags.development,
    title: "เชื่อมต่อ API ระบบชำระเงิน (Stripe)",
    description: "เขียนโค้ดฝั่ง Backend และทำ Webhook รับข้อมูลสถานะการจ่ายเงิน",
    progress: 25, initials: "DEV"
  },
  {
    id: "12", columnId: "todo", categoryId: "marketing", tag: tags.marketing,
    title: "เขียนบทความ SEO ประจำเดือน",
    description: "หัวข้อ: 5 เคล็ดลับการจัดการโปรเจกต์ให้มีประสิทธิภาพ",
    comments: 0, dueDate: getOffsetDate(3)
  },
  {
    id: "13", columnId: "review", categoryId: "design", tag: tags.design,
    title: "ตรวจสอบความเรียบร้อยของ Dark Mode",
    description: "เช็ค Contrast สีทั้งหมดให้ผ่านมาตรฐาน WCAG 2.1",
    avatars: ["https://i.pravatar.cc/150?img=22"], progress: 85, attachments: 5
  },
  {
    id: "14", columnId: "done", categoryId: "research", tag: tags.research,
    title: "รวบรวม Feedback จากทีม Customer Support",
    description: "สรุปประเด็นปัญหาที่พบบ่อยที่สุดในเดือนที่ผ่านมา",
    progress: 100, initials: "CS", attachments: 1
  },
  {
    id: "15", columnId: "todo", categoryId: "development", tag: tags.development,
    title: "อัปเดตเวอร์ชัน Next.js เป็น 14",
    description: "ทดสอบการทำงานของระบบทั้งหมดหลังจากการอัปเกรด",
    dueDate: getOffsetDate(14)
  }
];