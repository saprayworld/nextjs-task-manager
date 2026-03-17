import React from "react";
import TrashList from "@/components/kanban/trash-list";
import { getTrashedTasks } from "@/lib/actions/task";

export default async function TrashPage() {
  const dbTasks = await getTrashedTasks();

  const formattedTasks = dbTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    columnId: task.columnId,
    dueDate: task.dueDate,
    updatedAt: task.updatedAt,
  }));

  return <TrashList initialTasks={formattedTasks} />;
}
