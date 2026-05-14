import KanbanBoard from '@/components/kanban/kanban-board';
import { mockColumns } from '@/components/kanban/mock-data';
import { getCategories } from '@/lib/actions/category';
import { getTasks } from '@/lib/actions/task';
import { categoriesToTagMap } from '@/lib/category-utils';
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations("KanbanBoard");

  // 1. ดึงข้อมูลงานทั้งหมดของผู้ใช้คนนี้จาก Database (ปลอดภัย 100% เพราะเช็ค Session แล้ว)
  const dbTasks = await getTasks();

  // 2. ดึง categories จาก DB แล้วแปลงเป็น tag map
  const categories = await getCategories();
  const tagMap = categoriesToTagMap(categories);

  // 3. แปลงข้อมูลจาก DB ให้มีโครงสร้างตรงกับ Interface Task ที่ Board ต้องการ
  const formattedTasks = dbTasks.map(task => {
    const tagInfo = tagMap[task.categoryId || 'default'] || tagMap['default'] || { text: 'Default', classes: 'border rounded-full' };

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
    // title: t(`columns.${col.id}`) || col.title
  }));

  return (
    // โยนข้อมูลจริงลงไปใน Board แทน mockTasks
    <KanbanBoard
      initialColumns={translatedColumns}
      initialTasks={formattedTasks}
      categories={categories}
    />
  );
}