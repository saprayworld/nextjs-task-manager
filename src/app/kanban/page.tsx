'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Moon, Sun, Plus, MoreHorizontal, Edit2, Paperclip, MessageSquare, Clock, LayoutDashboard } from 'lucide-react';
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
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  priority?: 'normal' | 'urgent';
  assignees: Array<{ name: string; avatar?: string; initials?: string }>;
  attachments: number;
  comments: number;
  progress?: number;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'ออกแบบ UI หน้า About Us',
    description: 'จัดวางโครงสร้างหน้าเพจใหม่ให้เข้ากับธีมของธุรกิจ เน้นความเรียบหรู',
    category: 'Design',
    categoryColor: 'text-blue-600',
    categoryBg: 'bg-blue-50 dark:bg-blue-900/30',
    assignees: [
      { name: 'User 1', avatar: 'https://i.pravatar.cc/150?img=11' },
      { name: 'User 2', avatar: 'https://i.pravatar.cc/150?img=32' }
    ],
    attachments: 2,
    comments: 4
  },
  {
    id: '2',
    title: 'วิเคราะห์คู่แข่งในตลาด',
    description: 'รวบรวมข้อมูลฟีเจอร์เด่นๆ ของระบบจัดการโปรเจกต์ 3 เจ้าหลัก',
    category: 'Research',
    categoryColor: 'text-amber-600',
    categoryBg: 'bg-amber-50 dark:bg-amber-900/30',
    priority: 'urgent',
    assignees: [
      { name: 'John Smith', initials: 'JS' }
    ],
    attachments: 0,
    comments: 0,
    dueDate: 'วันนี้'
  },
  {
    id: '3',
    title: 'พัฒนาระบบ Drag & Drop',
    description: 'เขียนสคริปต์ให้สามารถย้ายการ์ดข้ามคอลัมน์ได้ด้วย HTML5 API',
    category: 'Development',
    categoryColor: 'text-emerald-600',
    categoryBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    assignees: [
      { name: 'Developer', avatar: 'https://i.pravatar.cc/150?img=33' }
    ],
    attachments: 0,
    comments: 1,
    progress: 65
  }
];

export default function KanbanBoard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'To Do', color: 'bg-slate-400 dark:bg-slate-500', tasks: [initialTasks[0], initialTasks[1]] },
    { id: 'inprogress', title: 'In Progress', color: 'bg-primary animate-pulse', tasks: [initialTasks[2]] },
    { id: 'review', title: 'Review', color: 'bg-amber-400', tasks: [] },
    { id: 'done', title: 'Done', color: 'bg-emerald-500', tasks: [] }
  ]);
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = findColumnOfTask(overId) || findColumnById(overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      setColumns(prevColumns => {
        const activeTasks = prevColumns.find(col => col.id === activeColumn.id)?.tasks || [];
        const overTasks = prevColumns.find(col => col.id === overColumn.id)?.tasks || [];
        
        const activeIndex = activeTasks.findIndex(task => task.id === activeId);
        const overIndex = overTasks.findIndex(task => task.id === overId);

        const newColumns = prevColumns.map(column => {
          if (column.id === activeColumn.id) {
            return {
              ...column,
              tasks: column.tasks.filter(task => task.id !== activeId)
            };
          }
          if (column.id === overColumn.id) {
            const newTasks = [...column.tasks];
            const activeTask = activeTasks[activeIndex];
            
            if (overIndex === -1) {
              newTasks.push(activeTask);
            } else {
              newTasks.splice(overIndex, 0, activeTask);
            }
            
            return {
              ...column,
              tasks: newTasks
            };
          }
          return column;
        });

        return newColumns;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = findColumnOfTask(overId) || findColumnById(overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Reorder within the same column
      setColumns(prevColumns => {
        return prevColumns.map(column => {
          if (column.id === activeColumn.id) {
            const oldIndex = column.tasks.findIndex(task => task.id === activeId);
            const newIndex = column.tasks.findIndex(task => task.id === overId);
            
            return {
              ...column,
              tasks: arrayMove(column.tasks, oldIndex, newIndex)
            };
          }
          return column;
        });
      });
    }

    setActiveTask(null);
  };

  const findTaskById = (id: string): Task | undefined => {
    for (const column of columns) {
      const task = column.tasks.find(task => task.id === id);
      if (task) return task;
    }
    return undefined;
  };

  const findColumnOfTask = (taskId: string): Column | undefined => {
    return columns.find(column => 
      column.tasks.some(task => task.id === taskId)
    );
  };

  const findColumnById = (id: string): Column | undefined => {
    return columns.find(column => column.id === id);
  };

  const getTaskCount = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    return column ? column.tasks.length : 0;
  };

  const SortableTaskCard = ({ task }: { task: Task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-grab"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-between mb-3">
          <Badge className={`text-[10px] font-semibold tracking-wider uppercase ${task.categoryColor} ${task.categoryBg} px-2 py-1 rounded-md border-none`}>
            {task.category}
          </Badge>
          <button className="text-slate-300 hover:text-slate-500 opacity-0 hover:opacity-100 transition-colors">
            <Edit2 className="w-3 h-3" />
          </button>
        </div>
        
        <h3 className="font-medium text-sm mb-1 text-slate-900 dark:text-slate-100">{task.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">{task.description}</p>
        
        {task.progress !== undefined && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <div className="flex -space-x-2">
            {task.assignees.map((assignee, index) => (
              <Avatar key={index} className="w-6 h-6 border-2 border-white dark:border-slate-950">
                {assignee.avatar ? (
                  <AvatarImage src={assignee.avatar} alt={assignee.name} />
                ) : (
                  <AvatarFallback className="text-[10px] font-medium bg-primary text-white">
                    {assignee.initials}
                  </AvatarFallback>
                )}
              </Avatar>
            ))}
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            {task.attachments > 0 && (
              <span className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <Paperclip className="w-3 h-3" /> {task.attachments}
              </span>
            )}
            {task.comments > 0 && (
              <span className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <MessageSquare className="w-3 h-3" /> {task.comments}
              </span>
            )}
            {task.priority === 'urgent' && task.dueDate && (
              <span className="flex items-center gap-1 text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                <Clock className="w-3 h-3" /> {task.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DroppableColumn = ({ column }: { column: Column }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.id,
    });

    return (
      <div
        ref={setNodeRef}
        className={`flex flex-col w-80 shrink-0 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl max-h-full transition-all ${
          isOver ? 'ring-2 ring-primary/20' : ''
        }`}
      >
        {/* Column Header */}
        <div className="p-4 flex items-center justify-between shrink-0 cursor-default">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
            <h2 className="font-semibold text-sm">{column.title}</h2>
            <Badge
              variant={column.id === 'inprogress' ? 'default' : 'secondary'}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                column.id === 'inprogress' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {getTaskCount(column.id)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Droppable Area */}
        <div className="p-4 pt-0 flex flex-col gap-3 overflow-y-auto min-h-[150px]">
          <SortableContext
            items={column.tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 h-screen flex flex-col font-sans transition-colors duration-200">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Project Board</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">จัดการงานและโปรเจกต์ (Desktop View)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex relative items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหางาน..."
                className="pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border-none rounded-md focus:ring-2 focus:ring-primary outline-none transition-shadow text-slate-700 dark:text-slate-200 w-64"
              />
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
              title="สลับโหมดสี"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm active:scale-95">
              <Plus className="w-4 h-4" />
              สร้างงานใหม่
            </Button>
          </div>
        </header>

        {/* Board Area */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex gap-6 h-full items-start w-max">
            {columns.map((column) => (
              <DroppableColumn key={column.id} column={column} />
            ))}
          </div>
        </main>
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg rotate-2">
            <div className="flex items-center justify-between mb-3">
              <Badge className={`text-[10px] font-semibold tracking-wider uppercase ${activeTask.categoryColor} ${activeTask.categoryBg} px-2 py-1 rounded-md border-none`}>
                {activeTask.category}
              </Badge>
            </div>
            <h3 className="font-medium text-sm mb-1 text-slate-900 dark:text-slate-100">{activeTask.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">{activeTask.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
