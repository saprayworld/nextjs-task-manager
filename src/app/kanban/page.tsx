import KanbanBoard from '@/components/kanban/kanban-board';
import { mockColumns } from '@/components/kanban/mock-data';
import { getCategories } from '@/lib/actions/category';
import { getUserSettings } from '@/lib/actions/setting';
import { getTasks } from '@/lib/actions/task';
import { categoriesToCategoryInfoMap } from '@/lib/category-utils';
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations("KanbanBoard");

  // 1. ดึงข้อมูลทั้งหมดพร้อมกัน (Parallel Fetch)
  const [dbTasks, categories, settings] = await Promise.all([
    getTasks(),
    getCategories(),
    getUserSettings(),
  ]);

  // 2. แปลง categories เป็น category map
  const categoryMap = categoriesToCategoryInfoMap(categories);

  // 3. แปลงข้อมูลจาก DB ให้มีโครงสร้างตรงกับ Interface Task ที่ Board ต้องการ
  const formattedTasks = dbTasks.map(task => {
    const categoryInfo = categoryMap[task.categoryId || 'default'] || categoryMap['default'] || { text: 'Default', classes: 'border rounded-full' };

    return {
      id: task.id,
      columnId: task.columnId,
      categoryId: task.categoryId || undefined,
      title: task.title,
      description: task.description || undefined,
      dueDate: task.dueDate || undefined,
      dueDateClasses: task.dueDate ? "text-destructive bg-destructive/10" : undefined,
      category: categoryInfo,
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

  // 4. สร้าง boardSettings จาก user settings
  const boardSettings = {
    defaultColumn: settings.defaultColumn,
    showProgress: settings.showProgress,
    showDueDate: settings.showDueDate,
    enableDragDrop: settings.enableDragDrop,
  };

  return (
    // โยนข้อมูลจริงลงไปใน Board แทน mockTasks
    <KanbanBoard
      initialColumns={translatedColumns}
      initialTasks={formattedTasks}
      categories={categories}
      boardSettings={boardSettings}
    />
  );
}