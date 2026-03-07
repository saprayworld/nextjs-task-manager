
import KanbanBoard, { Task } from '@/components/kanban/kanban-board';
import { BoardColumn } from '@/components/kanban/TaskDialog';

// ==========================================
// Mock Data (สามารถสลับไปดึงจาก Database แทนได้ในอนาคต)
// ==========================================
const getTodayDate = () => new Date().toISOString().split('T')[0];

const mockColumns: BoardColumn[] = [
  { id: "todo", title: "To Do", dotColor: "bg-muted-foreground" },
  { id: "inprogress", title: "In Progress", dotColor: "bg-primary animate-pulse" },
  { id: "review", title: "Review", dotColor: "bg-amber-400" },
  { id: "done", title: "Done", dotColor: "bg-emerald-500" },
];

const mockTasks: Task[] = [
  { 
    id: "1", 
    columnId: "todo", 
    categoryId: "design",
    tag: { text: "Design", classes: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
    title: "ออกแบบ UI หน้า About Us",
    description: "จัดวางโครงสร้างหน้าเพจใหม่ให้เข้ากับธีมของธุรกิจ เน้นความเรียบหรู",
    avatars: ["https://i.pravatar.cc/150?img=11", "https://i.pravatar.cc/150?img=32"],
    attachments: 2,
    comments: 4
  },
  { 
    id: "2", 
    columnId: "todo", 
    categoryId: "research",
    tag: { text: "Research", classes: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    title: "วิเคราะห์คู่แข่งในตลาด",
    description: "รวบรวมข้อมูลฟีเจอร์เด่นๆ ของระบบจัดการโปรเจกต์ 3 เจ้าหลัก",
    initials: "JS",
    dueDate: getTodayDate(),
    dueDateClasses: "text-destructive bg-destructive/10"
  },
  { 
    id: "3", 
    columnId: "inprogress", 
    categoryId: "development",
    tag: { text: "Development", classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
    title: "พัฒนาระบบ Drag & Drop",
    description: "เขียนสคริปต์ให้สามารถย้ายการ์ดข้ามคอลัมน์ได้ด้วย dnd-kit",
    progress: 65,
    avatars: ["https://i.pravatar.cc/150?img=33"],
    comments: 1
  },
];

export default function Page() {
  return (
    <KanbanBoard 
      initialColumns={mockColumns} 
      initialTasks={mockTasks} 
    />
  );
}