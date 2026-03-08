"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Imports Components ย่อย
import { KanbanListView } from "./kanban-list-view";
import { TaskDialog, TaskFormData, BoardColumn } from "./TaskDialog";
import { Task, Tag } from "./kanban-board";

interface KanbanListProps {
  initialColumns: BoardColumn[];
  initialTasks: Task[];
}

export default function KanbanList({ initialColumns, initialTasks }: KanbanListProps) {
  const [columns] = useState<BoardColumn[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenCreateDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      setTasks(prevTasks => prevTasks.filter(t => t.id !== editingTask.id));
      setIsDialogOpen(false); 
    }
  };

  const handleSaveTask = (data: TaskFormData) => {
    const categoryTagMap: Record<string, Tag> = {
      design: { text: "Design", classes: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
      development: { text: "Development", classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
      research: { text: "Research", classes: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
      marketing: { text: "Marketing", classes: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
    };

    const tagInfo = categoryTagMap[data.categoryId] || categoryTagMap.design;
    const dueDateClasses = data.dueDate ? "text-destructive bg-destructive/10" : undefined;

    if (editingTask) {
      setTasks(prevTasks => prevTasks.map(t => {
        if (t.id === editingTask.id) {
          return {
            ...t,
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            columnId: data.columnId,
            tag: tagInfo,
            dueDate: data.dueDate,
            dueDateClasses: dueDateClasses
          };
        }
        return t;
      }));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        columnId: data.columnId || "todo",
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        tag: tagInfo,
        dueDate: data.dueDate,
        dueDateClasses: dueDateClasses,
      };
      setTasks([...tasks, newTask]);
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Header เฉพาะของหน้า List */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Task List</h2>
          <p className="text-xs text-muted-foreground hidden sm:block">ดูและจัดการงานทั้งหมดในรูปแบบตาราง</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="flex items-center gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-sm font-medium shadow-sm shrink-0">
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">สร้างงานใหม่</span>
          <span className="inline sm:hidden">สร้าง</span>
        </Button>
      </div>

      <main className="flex-1 overflow-x-auto p-4 sm:p-6 pt-0 pb-6">
        <KanbanListView 
          tasks={tasks} 
          columns={columns} 
          onEditTask={handleOpenEditDialog} 
        />
      </main>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        taskToEdit={editingTask}
        columns={columns}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}