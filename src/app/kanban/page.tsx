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
  Plus, 
  MoreHorizontal, 
  LayoutDashboard, 
  Search, 
  Moon, 
  Edit2, 
  Paperclip, 
  MessageSquare, 
  Clock,
  Trash2
} from 'lucide-react';

// นำเข้า Components จาก shadcn/ui ของจริงในโปรเจกต์ของคุณ
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ==========================================
// 1. Types & Interfaces
// ==========================================

export type Id = string | number;

export interface Tag {
  text: string;
  classes: string;
}

export interface Task {
  id: Id;
  columnId: Id;
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

export interface BoardColumn {
  id: Id;
  title: string;
  dotColor: string;
}

// ==========================================
// 2. ข้อมูลเริ่มต้น (Initial Data)
// ==========================================

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
    tag: { text: "Research", classes: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    title: "วิเคราะห์คู่แข่งในตลาด",
    description: "รวบรวมข้อมูลฟีเจอร์เด่นๆ ของระบบจัดการโปรเจกต์ 3 เจ้าหลัก",
    initials: "JS",
    dueDate: "วันนี้",
    dueDateClasses: "text-destructive bg-destructive/10"
  },
  { 
    id: "3", 
    columnId: "inprogress", 
    tag: { text: "Development", classes: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
    title: "พัฒนาระบบ Drag & Drop",
    description: "เขียนสคริปต์ให้สามารถย้ายการ์ดข้ามคอลัมน์ได้ด้วย dnd-kit",
    progress: 65,
    avatars: ["https://i.pravatar.cc/150?img=33"],
    comments: 1
  },
];

// ==========================================
// 3. Components สำหรับบอร์ดและงาน (Tasks)
// ==========================================

interface TaskCardProps {
  task: Task;
  deleteTask: (id: Id) => void;
}

function TaskCard({ task, deleteTask }: TaskCardProps) {
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
      {/* ส่วนหัวการ์ด (Tag & Actions) */}
      <div className="flex items-center justify-between mb-3">
        {task.tag && (
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md ${task.tag.classes}`}>
            {task.tag.text}
          </span>
        )}
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* เนื้อหาการ์ด */}
      <h3 className="font-medium text-sm mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-muted-foreground text-xs line-clamp-2 mb-4">{task.description}</p>
      )}
      
      {/* Progress Bar (ถ้ามี) */}
      {task.progress !== undefined && (
        <div className="w-full bg-secondary rounded-full h-1.5 mb-4 overflow-hidden">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
        </div>
      )}

      {/* Footer การ์ด (Avatars & Stats) */}
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
              <Clock className="w-3 h-3" /> {task.dueDate}
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
  createTask: (columnId: Id, title: string) => void;
  deleteTask: (id: Id) => void;
}

function Column({ column, tasks, createTask, deleteTask }: ColumnProps) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      return;
    }
    createTask(column.id, newTaskTitle);
    setNewTaskTitle("");
    setIsAdding(false);
  };

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-80 shrink-0 bg-muted/50 border rounded-xl max-h-full"
    >
      {/* ส่วนหัวคอลัมน์ */}
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

      {/* พื้นที่ของงาน (Droppable Area) */}
      <div className="p-4 pt-0 flex flex-col gap-3 overflow-y-auto min-h-[150px] flex-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} />
          ))}
        </SortableContext>
        
        {/* ฟอร์มเพิ่มงาน */}
        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex flex-col gap-2 mt-2">
            <Input
              autoFocus
              placeholder="หัวข้อการ์ด..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => { if(!newTaskTitle) setIsAdding(false); }}
              className="h-8 text-sm bg-card"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="w-full h-8 text-xs">เพิ่ม</Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:bg-secondary/80 mt-1 h-8 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-2 w-3.5 h-3.5" /> เพิ่มการ์ดใหม่
          </Button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. หน้าจอหลัก (Main App Component)
// ==========================================

export default function KanbanBoard() {
  const [columns] = useState<BoardColumn[]>(defaultColumns);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const createTask = (columnId: Id, title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      columnId,
      title,
      // ใส่ tag ค่าเริ่มต้นเพื่อให้ดูสวยงาม
      tag: { text: "Task", classes: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (taskId: Id) => setTasks(tasks.filter((task) => task.id !== taskId));

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
      
      {/* Top Navigation / Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Project Board</h1>
            <p className="text-xs text-muted-foreground">จัดการงานและโปรเจกต์ (Next.js + shadcn)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex relative items-center">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="ค้นหางาน..." 
              className="pl-9 pr-4 h-9 w-64 bg-muted/50 border-transparent focus-visible:ring-primary"
            />
          </div>

          <div className="w-px h-6 bg-border mx-1"></div>

          <Button variant="ghost" size="icon" className="text-muted-foreground" title="สลับโหมดสี (จัดการผ่าน next-themes)">
            <Moon className="w-5 h-5" />
          </Button>
          
          <Button className="flex items-center gap-2 h-9 text-sm font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            สร้างงานใหม่
          </Button>
        </div>
      </header>

      {/* Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start w-max">
            {columns.map((col) => (
              <Column
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
                createTask={createTask}
                deleteTask={deleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} deleteTask={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}