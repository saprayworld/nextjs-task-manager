"use client";

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Imports Components ย่อย
import { KanbanListView } from "./kanban-list-view";
import { TaskDialog, TaskFormData, BoardColumn } from "./TaskDialog";
import { TaskDetailsDialog } from "./TaskDetailsDialog";
import { Task } from "./kanban-board";
import { CategoryRecord, categoriesToCategoryInfoMap } from "@/lib/category-utils";

import { createTask, updateTask, deleteTask, syncSubtasks, archiveTask, toggleSubtask } from "@/lib/actions/task";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface KanbanListProps {
  initialColumns: BoardColumn[];
  initialTasks: Task[];
  categories: CategoryRecord[];
}

export default function KanbanList({ initialColumns, initialTasks, categories }: KanbanListProps) {
  const t = useTranslations('KanbanList');
  const tToast = useTranslations('KanbanBoard.toast');

  const [columns] = useState<BoardColumn[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const handleOpenCreateDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async () => { // เปลี่ยนเป็น async
    if (editingTask) {
      const previousTasks = tasks;
      // อัปเดตหน้าจอทันที
      setTasks(prevTasks => prevTasks.filter(t => t.id !== editingTask.id));
      setIsDialogOpen(false);

      try {
        // ย้ายงานไปถังขยะ (Soft Delete)
        await deleteTask(editingTask.id as string);
        toast.success(tToast('trashSuccess'), {
          description: tToast('trashSuccessDesc', { title: editingTask.title }),
        });
      } catch {
        // Rollback กลับถ้าไม่สำเร็จ
        setTasks(previousTasks);
        toast.error(tToast('trashError'), {
          description: tToast('errorTryAgain'),
        });
      }
    }
  };

  const handleArchiveTask = async () => {
    if (editingTask) {
      const previousTasks = tasks;
      setTasks(prevTasks => prevTasks.filter(t => t.id !== editingTask.id));
      setIsDialogOpen(false);

      try {
        await archiveTask(editingTask.id as string);
        toast.success(tToast('archiveSuccess'), {
          description: tToast('archiveSuccessDesc', { title: editingTask.title }),
        });
      } catch {
        setTasks(previousTasks);
        toast.error(tToast('archiveError'), {
          description: tToast('errorTryAgain'),
        });
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (editingTask) {
      const currentVisibility = (editingTask as any).isVisible !== false;
      const newVisibility = !currentVisibility;

      try {
        await updateTask(editingTask.id as string, { isVisible: newVisibility });
        // อัปเดท local state และปิด Dialog หลังบันทึกสำเร็จ
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === editingTask.id ? { ...t, isVisible: newVisibility } as any : t
        ));
        setIsDialogOpen(false);
        toast.success(newVisibility ? tToast('showSuccess') : tToast('hideSuccess'), {
          description: newVisibility ? tToast('showSuccessDesc', { title: editingTask.title }) : tToast('hideSuccessDesc', { title: editingTask.title }),
        });
      } catch {
        toast.error(tToast('hideError'), {
          description: tToast('errorTryAgain'),
        });
      }
    }
  };

  const handleOpenDetailsDialog = (task: Task) => {
    setViewingTask(task);
    setIsDetailsOpen(true);
  };

  const handleDeleteFromDetails = async () => {
    if (viewingTask) {
      const targetTask = viewingTask;
      const previousTasks = tasks;
      setTasks(prevTasks => prevTasks.filter(t => t.id !== targetTask.id));
      setIsDetailsOpen(false);

      try {
        await deleteTask(targetTask.id as string);
        toast.success(tToast('trashSuccess'), {
          description: tToast('trashSuccessDesc', { title: targetTask.title }),
        });
      } catch {
        setTasks(previousTasks);
        toast.error(tToast('trashError'), {
          description: tToast('errorTryAgain'),
        });
      }
    }
  };

  const handleArchiveFromDetails = async () => {
    if (viewingTask) {
      const targetTask = viewingTask;
      const previousTasks = tasks;
      setTasks(prevTasks => prevTasks.filter(t => t.id !== targetTask.id));
      setIsDetailsOpen(false);

      try {
        await archiveTask(targetTask.id as string);
        toast.success(tToast('archiveSuccess'), {
          description: tToast('archiveSuccessDesc', { title: targetTask.title }),
        });
      } catch {
        setTasks(previousTasks);
        toast.error(tToast('archiveError'), {
          description: tToast('errorTryAgain'),
        });
      }
    }
  };

  const handleToggleVisibilityFromDetails = async () => {
    if (viewingTask) {
      const targetTask = viewingTask;
      const currentVisibility = (targetTask as any).isVisible !== false;
      const newVisibility = !currentVisibility;

      try {
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === targetTask.id ? { ...t, isVisible: newVisibility } as any : t
        ));
        setIsDetailsOpen(false);
        await updateTask(targetTask.id as string, { isVisible: newVisibility });
        toast.success(newVisibility ? tToast('showSuccess') : tToast('hideSuccess'), {
          description: newVisibility ? tToast('showSuccessDesc', { title: targetTask.title }) : tToast('hideSuccessDesc', { title: targetTask.title }),
        });
      } catch {
        toast.error(tToast('hideError'), {
          description: tToast('errorTryAgain'),
        });
      }
    }
  };

  const handleSubtaskToggle = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks?.map(st => st.id === subtaskId ? { ...st, isCompleted } : st) || [];
        const completedCount = updatedSubtasks.filter(st => st.isCompleted).length;
        const newProgress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : 0;
        const updatedTask = {
          ...t,
          subtasks: updatedSubtasks,
          progress: newProgress
        };
        if (viewingTask && viewingTask.id === taskId) {
          setViewingTask(updatedTask);
        }
        return updatedTask;
      }
      return t;
    }));

    try {
      await toggleSubtask(subtaskId, isCompleted, taskId);
    } catch {
      toast.error(tToast('saveError'), {
        description: tToast('errorTryAgain'),
      });
    }
  };

  const handleSaveTask = async (data: TaskFormData) => { // เปลี่ยนเป็น async
    const categoryMap = categoriesToCategoryInfoMap(categories);

    const categoryInfo = categoryMap[data.categoryId] || categoryMap['default'] || { text: 'Default', classes: 'border rounded-full' };
    const dueDateClasses = data.dueDate ? "text-destructive bg-destructive/10" : undefined;

    try {
      const subtasks = data.subtasks || [];
      const completedCount = subtasks.filter(st => st.isCompleted).length;
      const newProgress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

      if (editingTask) {
        // กรณีแก้ไขงาน: อัปเดตหน้าจอทันที
        setTasks(prevTasks => prevTasks.map(t => {
          if (t.id === editingTask.id) {
            return {
              ...t,
              title: data.title,
              description: data.description,
              categoryId: data.categoryId,
              columnId: data.columnId,
              category: categoryInfo,
              dueDate: data.dueDate,
              subtasks: data.subtasks,
              progress: newProgress,
              dueDateClasses: dueDateClasses
            };
          }
          return t;
        }));

        // สั่งอัปเดตลง Database ในแบคกราวด์
        await updateTask(editingTask.id as string, {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          columnId: data.columnId,
          dueDate: data.dueDate,
          startDateTime: data.startDateTime ? new Date(data.startDateTime) : null,
          endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
          totalWorkTime: data.totalWorkTime,
        });

        await syncSubtasks(editingTask.id as string, data.subtasks);

        toast.success(tToast('saveSuccess'), {
          description: tToast('updateSuccessDesc', { title: data.title }),
        });

      } else {
        // กรณีสร้างงานใหม่: บันทึกลง DB ก่อนเพื่อขอ ID
        const savedTask = await createTask({
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          columnId: data.columnId || "todo",
          dueDate: data.dueDate,
          startDateTime: data.startDateTime ? new Date(data.startDateTime) : undefined,
          endDateTime: data.endDateTime ? new Date(data.endDateTime) : undefined,
          totalWorkTime: data.totalWorkTime,
        });

        await syncSubtasks(savedTask.id as string, data.subtasks);

        const newTask: Task = {
          id: savedTask.id, // ใช้ ID ที่ได้จาก Database
          columnId: savedTask.columnId,
          title: savedTask.title,
          description: savedTask.description || undefined,
          categoryId: savedTask.categoryId || undefined,
          category: categoryInfo,
          dueDate: savedTask.dueDate || undefined,
          dueDateClasses: dueDateClasses,
          subtasks: data.subtasks,
          progress: newProgress,
        };
        setTasks([...tasks, newTask]);

        toast.success(tToast('createSuccess'), {
          description: tToast('createSuccessDesc', { title: data.title }),
        });
      }

      setIsDialogOpen(false);
    } catch {
      toast.error(tToast('saveError'), {
        description: tToast('errorTryAgain'),
      });
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header เฉพาะของหน้า List */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
          <p className="text-xs text-muted-foreground hidden sm:block">{t('description')}</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="flex items-center cursor-pointer gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-sm font-medium shadow-sm shrink-0">
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t('createNewTask')}</span>
          <span className="inline sm:hidden">{t('create')}</span>
        </Button>
      </div>

      <main className="flex-1 overflow-x-auto p-4 sm:p-6 pt-0 pb-6">
        <KanbanListView
          tasks={tasks}
          columns={columns}
          categories={categories}
          onEditTask={handleOpenEditDialog}
          onViewTask={handleOpenDetailsDialog}
        />
      </main>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        taskToEdit={editingTask}
        columns={columns}
        categories={categories}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onArchive={handleArchiveTask}
        onToggleVisibility={handleToggleVisibility}
      />

      <TaskDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        task={viewingTask}
        columns={columns}
        categories={categories}
        onEdit={handleOpenEditDialog}
        onDelete={handleDeleteFromDetails}
        onArchive={handleArchiveFromDetails}
        onToggleVisibility={handleToggleVisibilityFromDetails}
        onSubtaskToggle={handleSubtaskToggle}
      />
    </div>
  );
}