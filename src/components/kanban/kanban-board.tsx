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
          const updatedTask: Task = {
            ...t,
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            tag: tagInfo,
            dueDate: data.dueDate,
            dueDateClasses: dueDateClasses
          };

          if (editingTask.columnId !== data.columnId) {
            updatedTask.columnId = data.columnId;
          }

          return updatedTask;
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

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Header เฉพาะของหน้า Board */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Kanban Board</h2>
          <p className="text-xs text-muted-foreground hidden sm:block">จัดการและติดตามสถานะงานทั้งหมด</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="flex items-center gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-sm font-medium shadow-sm shrink-0">
          <Plus className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">สร้างงานใหม่</span>
          <span className="inline sm:hidden">สร้าง</span>
        </Button>
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
                tasks={tasks.filter((task) => task.columnId === col.id)}
                onEditTask={handleOpenEditDialog}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <KanbanTaskCard task={activeTask} onEdit={() => {}} />
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
      />
    </div>
  );
}