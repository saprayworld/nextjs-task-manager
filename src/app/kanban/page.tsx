import KanbanBoard from '@/components/kanban/kanban-board'; // ปรับ Path ให้ตรงกับที่คุณเก็บไฟล์ Component ของคุณ
import { mockColumns, tags } from '@/components/kanban/mock-data';
import { getTasks } from '@/lib/actions/task';
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations("KanbanBoard");

  // 1. ดึงข้อมูลงานทั้งหมดของผู้ใช้คนนี้จาก Database (ปลอดภัย 100% เพราะเช็ค Session แล้ว)
  const dbTasks = await getTasks();

  // 2. แปลงข้อมูลจาก DB ให้มีโครงสร้างตรงกับ Interface Task ที่ Board ต้องการ
  const formattedTasks = dbTasks.map(task => {
    const tagInfo = tags[task.categoryId || 'design'] || tags.design;

    return {
      id: task.id,
      columnId: task.columnId,
      categoryId: task.categoryId || undefined,
      title: task.title,
      description: task.description || undefined,
      dueDate: task.dueDate || undefined,
      dueDateClasses: task.dueDate ? "text-destructive bg-destructive/10" : undefined,
      tag: tagInfo,
      progress: task.progress ?? undefined,
      subtasks: task.subtasks || [],
      startDateTime: task.startDateTime ? task.startDateTime.toISOString() : undefined,
      endDateTime: task.endDateTime ? task.endDateTime.toISOString() : undefined,
      totalWorkTime: task.totalWorkTime ?? undefined,
      order: task.order,
      recurringTemplateId: task.recurringTemplateId,
      recurrenceIndex: task.recurrenceIndex,
    };
  });

  const translatedColumns = mockColumns.map(col => ({
    ...col,
    title: t(`columns.${col.id}`) || col.title
  }));

  return (
    // โยนข้อมูลจริงลงไปใน Board แทน mockTasks
    <KanbanBoard
      initialColumns={translatedColumns}
      initialTasks={formattedTasks}
    />
  );
}