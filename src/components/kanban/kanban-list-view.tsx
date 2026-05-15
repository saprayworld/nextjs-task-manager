"use client";

import React, { useMemo } from "react";
import { Task } from "./kanban-board";
import { BoardColumn } from "./TaskDialog";
import { getKanbanColumns } from "./kanban-list-columns";
import { KanbanListTable } from "./kanban-list-table";
import { useTranslations, useLocale } from 'next-intl';

interface KanbanListViewProps {
  tasks: Task[];
  columns: BoardColumn[];
  onEditTask: (task: Task) => void;
}

export function KanbanListView({ tasks, columns, onEditTask }: KanbanListViewProps) {
  const t = useTranslations('KanbanList');
  const locale = useLocale();

  // ใช้ useMemo เพื่อจำลอง (Memoize) คอลัมน์ ไม่ให้ถูกสร้างใหม่ทุกครั้งที่ตารางรีเรนเดอร์
  const tableColumns = useMemo(
    () => getKanbanColumns(columns, onEditTask, t, locale),
    [columns, onEditTask, t, locale]
  );

  return (
    <KanbanListTable 
      columns={tableColumns} 
      data={tasks} 
      boardColumns={columns} // เพิ่ม prop นี้เข้าไป
    />
  );
}