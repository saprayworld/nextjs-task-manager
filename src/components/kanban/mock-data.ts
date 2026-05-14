import { BoardColumn } from "./TaskDialog";

export const getTodayDate = () => new Date().toISOString().split('T')[0];
export const getOffsetDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
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