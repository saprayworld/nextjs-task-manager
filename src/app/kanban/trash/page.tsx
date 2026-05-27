import React from "react";
import TrashList from "@/components/kanban/trash-list";
import { getTrashedTasks } from "@/lib/actions/task";
import { getCategories } from "@/lib/actions/category";

export default async function TrashPage() {
  const dbTasks = await getTrashedTasks();
  const categories = await getCategories();

  const formattedTasks = dbTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    columnId: task.columnId,
    dueDate: task.dueDate,
    updatedAt: task.updatedAt,
    deletedAt: task.deletedAt,
  }));

  return <TrashList initialTasks={formattedTasks} categories={categories} />;
}
