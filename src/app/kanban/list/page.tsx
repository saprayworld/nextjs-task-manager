import React from 'react';
import KanbanList from '@/components/kanban/kanban-list';
import { mockColumns, tags } from '@/components/kanban/mock-data';
import { getTasks } from '@/lib/actions/task';

export default async function ListPage() {
  // 1. ดึงข้อมูลงานทั้งหมดของผู้ใช้คนนี้จาก Database
  const dbTasks = await getTasks();

  // 2. แปลงข้อมูลจาก DB ให้มีโครงสร้างตรงกับ Interface Task
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
    };
  });

  return (
    <KanbanList
      initialColumns={mockColumns}
      initialTasks={formattedTasks}
    />
  );
}