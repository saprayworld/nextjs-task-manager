"use client";

import React, { useMemo } from "react";
import { Task } from "./kanban-board";
import { BoardColumn } from "./TaskDialog";
import { getKanbanColumns } from "./kanban-list-columns";
import { KanbanListTable } from "./kanban-list-table";
import { CategoryRecord } from "@/lib/category-utils";
import { useTranslations, useLocale } from 'next-intl';

interface KanbanListViewProps {
  tasks: Task[];
  columns: BoardColumn[];
  categories: CategoryRecord[];
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export function KanbanListView({ tasks, columns, categories, onEditTask, onViewTask }: KanbanListViewProps) {
  const t = useTranslations('KanbanList');
  const locale = useLocale();

  // ใช้ useMemo เพื่อจำลอง (Memoize) คอลัมน์ ไม่ให้ถูกสร้างใหม่ทุกครั้งที่ตารางรีเรนเดอร์
  const tableColumns = useMemo(
    () => getKanbanColumns(columns, onEditTask, onViewTask, t, locale),
    [columns, onEditTask, onViewTask, t, locale]
  );

  return (
    <KanbanListTable 
      columns={tableColumns} 
      data={tasks} 
      boardColumns={columns}
      categories={categories}
    />
  );
}