import React from "react";
import ArchiveList from "@/components/kanban/archive-list";
import { getArchivedTasks } from "@/lib/actions/task";
import { getCategories } from "@/lib/actions/category";

export default async function ArchivePage() {
  const dbTasks = await getArchivedTasks();
  const categories = await getCategories();

  const formattedTasks = dbTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    columnId: task.columnId,
    dueDate: task.dueDate,
    updatedAt: task.updatedAt,
    archivedAt: task.archivedAt,
  }));

  return <ArchiveList initialTasks={formattedTasks} categories={categories} />;
}
