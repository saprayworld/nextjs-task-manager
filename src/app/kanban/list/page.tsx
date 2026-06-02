import KanbanList from '@/components/kanban/kanban-list';
import { mockColumns } from '@/components/kanban/mock-data';
import { getCategories } from '@/lib/actions/category';
import { getTasks } from '@/lib/actions/task';
import { categoriesToCategoryInfoMap } from '@/lib/category-utils';

export default async function ListPage() {
  // 1. ดึงข้อมูลงานทั้งหมดของผู้ใช้คนนี้จาก Database
  const dbTasks = await getTasks({ includeHidden: true });

  // 2. ดึง categories จาก DB แล้วแปลงเป็น category map
  const categories = await getCategories();
  const categoryMap = categoriesToCategoryInfoMap(categories);

  // 3. แปลงข้อมูลจาก DB ให้มีโครงสร้างตรงกับ Interface Task
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
      isVisible: task.isVisible,
      createdAt: task.createdAt ? task.createdAt.toISOString() : undefined,
      updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
    };
  });

  return (
    <KanbanList
      initialColumns={mockColumns}
      initialTasks={formattedTasks}
      categories={categories}
    />
  );
}