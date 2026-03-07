"use client";

import React, { useState } from 'react';
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
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreHorizontal, 
  Edit2, 
  Paperclip, 
  MessageSquare, 
  Clock
} from 'lucide-react';

// Imports Components ของเรา
import { Navbar } from "@/components/kanban/Navbar";
import { TaskDialog, TaskFormData, BoardColumn } from "@/components/kanban/TaskDialog";

// ==========================================
// Types & Interfaces
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

// ==========================================
// Initial Data
// ==========================================
const getTodayDate = () => new Date().toISOString().split('T')[0];

const defaultColumns: BoardColumn[] = [
  { id: "todo", title: "To Do", dotColor: "bg-muted-foreground" },
  { id: "inprogress", title: "In Progress", dotColor: "bg-primary animate-pulse" },
  { id: "review", title: "Review", dotColor: "bg-amber-400" },
  { id: "done", title: "Done", dotColor: "bg-emerald-500" },
];

const defaultTasks: Task[] = [
  { 
    id: "1", 
    columnId: "todo", 
    categoryId: "design",
    tag: { text: "Design", classes: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
    title: "ออกแบบ UI หน้า About Us",
    description: "จัดวางโครงสร้างหน้าเพจใหม่ให้เข้ากับธีมของธุรกิจ เน้นความเรียบหรู",
    avatars: ["https://i.pravatar.cc/150?img=11", "https://i.pravatar.cc/150?img=32"],
    attachments: 2,
    comments: 4
  },
  { 
    id: "2", 
    columnId: "todo", 
    categoryId: "research",
    tag: { text: "Research", classes: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    title: "วิเคราะห์คู่แข่งในตลาด",
    description: "รวบรวมข้อมูลฟีเจอร์เด่นๆ ของระบบจัดการโปรเจกต์ 3 เจ้าหลัก",
    initials: "JS",
    dueDate: getTodayDate(),
    dueDateClasses: "text-destructive bg-destructive/10"
  },
  { 
    id: "3", 
    columnId: "inprogress", 
    categoryId: "development",
    tag: { text: "Development", classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
    title: "พัฒนาระบบ Drag & Drop",
    description: "เขียนสคริปต์ให้สามารถย้ายการ์ดข้ามคอลัมน์ได้ด้วย dnd-kit",
    progress: 65,
    avatars: ["https://i.pravatar.cc/150?img=33"],
    comments: 1
  },
];

const formatDateDisplay = (dateString?: string) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch(e) { 
    return dateString; 
  }
}

// ==========================================
// Sub-Components (Card & Column)
// ==========================================
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

function TaskCard({ task, onEdit }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 scale-95 shadow-lg bg-card border-2 border-dashed border-primary/50 min-h-[140px] rounded-lg"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-card text-card-foreground p-4 rounded-lg border shadow-sm hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-3">
        {task.tag && (
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md ${task.tag.classes}`}>
            {task.tag.text}
          </span>
        )}
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="แก้ไขงาน"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className="font-medium text-sm mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-muted-foreground text-xs line-clamp-2 mb-4">{task.description}</p>
      )}
      
      {task.progress !== undefined && (
        <div className="w-full bg-secondary rounded-full h-1.5 mb-4 overflow-hidden">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
        </div>
      )}

      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex -space-x-2">
          {task.avatars?.map((avatar, i) => (
            <img key={i} src={avatar} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-card bg-muted" />
          ))}
          {task.initials && (
            <div className="w-6 h-6 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium">
              {task.initials}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          {(task.attachments ?? 0) > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Paperclip className="w-3 h-3" /> {task.attachments}
            </span>
          )}
          {(task.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare className="w-3 h-3" /> {task.comments}
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${task.dueDateClasses || ''}`}>
              <Clock className="w-3 h-3" /> {formatDateDisplay(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

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
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ==========================================
// Main Page Component
// ==========================================
export default function KanbanBoard() {
  const [columns] = useState<BoardColumn[]>(defaultColumns);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
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
    <div className="h-screen flex flex-col bg-background text-foreground font-sans">
      
      {/* ใช้ Navbar Component ตรงนี้ */}
      <Navbar onOpenCreateDialog={handleOpenCreateDialog} />

      <main className="flex-1 overflow-x-auto p-4 sm:p-6 pb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
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
              <TaskCard task={activeTask} onEdit={() => {}} />
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