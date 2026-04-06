"use client";

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { LayoutDashboard, Search, Moon, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { createTask, updateTask, deleteTask, syncSubtasks, archiveTask, reorderTasks } from "@/lib/actions/task";

// Imports Components ย่อย
import { KanbanTaskCard } from "./kanban-task-card";
import { TaskDialog, TaskFormData, BoardColumn } from "./TaskDialog";

// ==========================================
// Types
// ==========================================
export type Id = string | number;

export interface Tag {
  text: string;
  classes: string;
}

export interface Subtask {
  id?: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: Id;
  columnId: Id;
  categoryId?: string;
  title: string;
  description?: string;
  tag?: Tag;
  avatars?: string[];
  attachments?: number;
  comments?: number;
  initials?: string;
  dueDate?: string;
  dueDateClasses?: string;
  progress?: number;
  subtasks?: Subtask[];
  startDateTime?: string;
  endDateTime?: string;
  totalWorkTime?: number;
  order?: number;
}

interface KanbanBoardProps {
  initialColumns: BoardColumn[];
  initialTasks: Task[];
}

// ==========================================
// Column Component (ย้ายมาไว้ข้างในนี้)
// ==========================================
interface ColumnProps {
  column: BoardColumn;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

function Column({ column, tasks, onEditTask }: ColumnProps) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-80 shrink-0 bg-muted/50 border rounded-xl max-h-full"
    >
      <div className="p-4 flex items-center justify-between shrink-0 cursor-default">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${column.dotColor}`}></div>
          <h2 className="font-semibold text-sm">{column.title}</h2>
          <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 pt-0 flex flex-col gap-3 overflow-y-auto min-h-[150px] flex-1 pb-4">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ==========================================
// Main Board Component
// ==========================================
export default function KanbanBoard({ initialColumns, initialTasks }: KanbanBoardProps) {
  const [columns] = useState<BoardColumn[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleOpenCreateDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (editingTask) {
      const previousTasks = tasks;
      // อัปเดตหน้าจอทันที (ให้ดูลื่นไหล)
      setTasks(prevTasks => prevTasks.filter(t => t.id !== editingTask.id));
      setIsDialogOpen(false);

      try {
        // ย้ายงานไปถังขยะ (Soft Delete)
        await deleteTask(editingTask.id as string);
        toast.success('ย้ายไปถังขยะสำเร็จ', {
          description: `"${editingTask.title}" ถูกย้ายไปถังขยะแล้ว`,
        });
      } catch {
        // Rollback กลับถ้าไม่สำเร็จ
        setTasks(previousTasks);
        toast.error('ย้ายไปถังขยะไม่สำเร็จ', {
          description: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
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
        toast.success('เก็บเข้าคลังสำเร็จ', {
          description: `"${editingTask.title}" ถูกเก็บเข้า Archive แล้ว`,
        });
      } catch {
        setTasks(previousTasks);
        toast.error('เก็บเข้าคลังไม่สำเร็จ', {
          description: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        });
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id as string, { isVisible: false });
        // อัปเดท local state และปิด Dialog หลังบันทึกสำเร็จ
        setTasks(prevTasks => prevTasks.filter(t => t.id !== editingTask.id));
        setIsDialogOpen(false);
        toast.success('ซ่อนงานสำเร็จ', {
          description: `"${editingTask.title}" ถูกซ่อนจาก Board แล้ว`,
        });
      } catch {
        toast.error('ซ่อนงานไม่สำเร็จ', {
          description: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
        });
      }
    }
  };

  const handleSaveTask = async (data: TaskFormData) => { // เปลี่ยนเป็น async
    const categoryTagMap: Record<string, Tag> = {
      design: { text: "Design", classes: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
      development: { text: "Development", classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
      research: { text: "Research", classes: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
      marketing: { text: "Marketing", classes: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
    };

    const tagInfo = categoryTagMap[data.categoryId] || categoryTagMap.design;
    const dueDateClasses = data.dueDate ? "text-destructive bg-destructive/10" : undefined;

    try {
      const subtasks = data.subtasks || [];
      const completedCount = subtasks.filter(st => st.isCompleted).length;
      const newProgress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

      if (editingTask) {
        // กรณีแก้ไขงาน: อัปเดตหน้าจอทันที
        setTasks(prevTasks => prevTasks.map(t => {
          if (t.id === editingTask.id) {
            const updatedTask: Task = {
              ...t,
              title: data.title,
              description: data.description,
              categoryId: data.categoryId,
              tag: tagInfo,
              dueDate: data.dueDate,
              subtasks: data.subtasks,
              progress: newProgress,
              dueDateClasses: dueDateClasses
            };
            if (editingTask.columnId !== data.columnId) {
              updatedTask.columnId = data.columnId;
            }
            return updatedTask;
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

        toast.success('บันทึกสำเร็จ', {
          description: `"${data.title}" ถูกอัปเดตเรียบร้อยแล้ว`,
        });

      } else {
        // กรณีสร้างงานใหม่: ต้องบันทึกลง DB ก่อนเพื่อขอ ID จริงๆ
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

        await syncSubtasks(savedTask.id, data.subtasks);

        const newTask: Task = {
          id: savedTask.id, // ใช้ ID ที่ได้จาก Database
          columnId: savedTask.columnId,
          title: savedTask.title,
          description: savedTask.description || undefined,
          categoryId: savedTask.categoryId || undefined,
          tag: tagInfo,
          dueDate: savedTask.dueDate || undefined,
          dueDateClasses: dueDateClasses,
          subtasks: data.subtasks,
          progress: newProgress,
          order: savedTask.order,
        };
        setTasks([...tasks, newTask]);

        toast.success('สร้างงานสำเร็จ', {
          description: `"${data.title}" ถูกเพิ่มเรียบร้อยแล้ว`,
        });
      }

      setIsDialogOpen(false);
    } catch {
      toast.error('บันทึกไม่สำเร็จ', {
        description: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task as Task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const overIndex = prevTasks.findIndex((t) => t.id === overId);

        if (prevTasks[activeIndex].columnId !== prevTasks[overIndex].columnId) {
          const newTasks = [...prevTasks];
          newTasks[activeIndex].columnId = prevTasks[overIndex].columnId;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t.id === activeId);
        const newTasks = [...prevTasks];
        newTasks[activeIndex].columnId = overId;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    setActiveTask(null);

    // หาว่าการ์ดที่ลากมา ตอนนี้ถูกจับยัดไปอยู่คอลัมน์ไหนใน State แล้ว
    // (State ถูกอัปเดตไปแล้วใน handleDragOver)
    const movedTask = tasks.find((t) => t.id === active.id);
    if (!movedTask) return;

    // คำนวณลำดับใหม่สำหรับคอลัมน์ที่เกี่ยวข้อง
    const affectedColumnIds = new Set<string>();
    affectedColumnIds.add(movedTask.columnId as string);
    // ถ้าย้ายข้ามคอลัมน์ ให้รวมคอลัมน์เดิมด้วย
    if (active.data.current?.task) {
      const originalColumnId = (active.data.current.task as Task).columnId as string;
      if (originalColumnId !== movedTask.columnId) {
        affectedColumnIds.add(originalColumnId);
      }
    }

    // สร้าง updates array สำหรับทุกการ์ดในคอลัมน์ที่ได้รับผลกระทบ
    const updates: { id: string; columnId: string; order: number }[] = [];
    for (const colId of affectedColumnIds) {
      const columnTasks = tasks.filter((t) => t.columnId === colId);
      columnTasks.forEach((t, index) => {
        updates.push({
          id: t.id as string,
          columnId: colId,
          order: index,
        });
      });
    }

    // อัปเดต order ใน local state ด้วย
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      for (const update of updates) {
        const idx = newTasks.findIndex((t) => t.id === update.id);
        if (idx !== -1) {
          newTasks[idx] = { ...newTasks[idx], order: update.order };
        }
      }
      return newTasks;
    });

    // บันทึกลำดับใหม่ลง Database
    try {
      await reorderTasks(updates);
    } catch {
      toast.error('บันทึกลำดับไม่สำเร็จ', {
        description: 'เกิดข้อผิดพลาดในการจัดเรียงการ์ด',
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    // Strip HTML tags ก่อน search description
    const plainDescription = task.description?.replace(/<[^>]*>/g, '') || '';
    return (
      task.title.toLowerCase().includes(lowerQuery) ||
      plainDescription.toLowerCase().includes(lowerQuery) ||
      task.tag?.text.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="flex flex-col h-full">

      {/* Header เฉพาะของหน้า Board */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Kanban Board</h2>
          <p className="text-xs text-muted-foreground">จัดการและติดตามสถานะงานทั้งหมด</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหางาน, ป้ายกำกับ..."
              className="w-full pl-8 h-9 text-sm bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenCreateDialog} className="flex cursor-pointer items-center gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-sm font-medium shadow-sm shrink-0">
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">สร้างงานใหม่</span>
            <span className="inline sm:hidden">สร้าง</span>
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-x-auto p-4 sm:p-6 pt-0 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* ... ส่วน <div className="flex gap-4..."> และโค้ดเดิมทั้งหมดคงไว้เหมือนเดิม ... */}
          <div className="flex gap-4 sm:gap-6 h-full items-start w-max">
            {columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                tasks={filteredTasks.filter((task) => task.columnId === col.id)}
                onEditTask={handleOpenEditDialog}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <KanbanTaskCard task={activeTask} onEdit={() => { }} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        taskToEdit={editingTask}
        columns={columns}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onArchive={handleArchiveTask}
        onToggleVisibility={handleToggleVisibility}
      />
    </div>
  );
}