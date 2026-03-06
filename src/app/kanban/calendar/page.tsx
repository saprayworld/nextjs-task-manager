'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays,
  Moon,
  Sun,
  Plus,
  LayoutDashboard,
  List,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import TaskDialog, { Task as TaskDialogType } from '@/components/TaskDialog';

interface CalendarTask {
  id: string;
  title: string;
  category: 'design' | 'development' | 'research';
  date: number;
  status: 'todo' | 'inprogress' | 'done';
  isSpanning?: boolean;
  isSpanStart?: boolean;
  isSpanEnd?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: number;
  comments?: number;
  assignees?: Array<{ name: string; avatar?: string; initials?: string }>;
  description?: string;
}

const sampleTasks: CalendarTask[] = [
  {
    id: '1',
    title: 'วิเคราะห์คู่แข่งในตลาด',
    category: 'research',
    date: new Date().getDate() + 2, // 2 days from today
    status: 'todo'
  },
  {
    id: '2',
    title: 'สร้าง Wireframe หน้าแรก',
    category: 'design',
    date: new Date().getDate() - 1, // Yesterday
    status: 'done'
  },
  {
    id: '3',
    title: 'ออกแบบ UI About Us',
    category: 'design',
    date: new Date().getDate(), // Today
    status: 'todo'
  },
  {
    id: '4',
    title: 'พัฒนาระบบ Drag & Drop',
    category: 'development',
    date: new Date().getDate() + 4, // 4 days from today
    status: 'inprogress',
    isSpanning: true,
    isSpanStart: true
  },
  {
    id: '5',
    title: 'พัฒนาระบบ Drag & Drop',
    category: 'development',
    date: new Date().getDate() + 5, // 5 days from today
    status: 'inprogress',
    isSpanning: true
  },
  {
    id: '6',
    title: 'พัฒนาระบบ Drag & Drop',
    category: 'development',
    date: new Date().getDate() + 6, // 6 days from today
    status: 'inprogress',
    isSpanning: true,
    isSpanEnd: true
  }
];

export default function CalendarPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date (dynamic)
  const [tasks, setTasks] = useState<CalendarTask[]>(sampleTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  useEffect(() => {
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

  const handleCreateTask = (date?: number) => {
    setDialogMode('create');
    setSelectedTask(null);
    setSelectedDate(date || getToday());
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: CalendarTask) => {
    setDialogMode('edit');
    setSelectedTask(task);
    setSelectedDate(task.date);
    setIsDialogOpen(true);
  };

  const handleViewTask = (task: CalendarTask) => {
    setDialogMode('view');
    setSelectedTask(task);
    setSelectedDate(task.date);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (taskData: TaskDialogType) => {
    if (dialogMode === 'create') {
      // Create new task
      const newTask: CalendarTask = {
        ...taskData,
        id: Date.now().toString(),
        date: selectedDate || getToday(),
        category: taskData.category as CalendarTask['category'],
        status: 'todo',
        priority: taskData.priority as CalendarTask['priority'],
        attachments: taskData.attachments || 0,
        comments: taskData.comments || 0,
        assignees: taskData.assignees || [],
        description: taskData.description
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
    } else if (dialogMode === 'edit' && selectedTask) {
      // Update existing task
      const updatedTask: CalendarTask = {
        ...taskData,
        id: selectedTask.id,
        date: selectedDate || selectedTask.date,
        category: taskData.category as CalendarTask['category'],
        status: taskData.column as CalendarTask['status'] || selectedTask.status,
        priority: taskData.priority as CalendarTask['priority'],
        attachments: taskData.attachments || selectedTask.attachments,
        comments: taskData.comments || selectedTask.comments,
        assignees: taskData.assignees || selectedTask.assignees,
        description: taskData.description || selectedTask.description
      };
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === selectedTask.id ? updatedTask : task
        )
      );
    }
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const getToday = () => {
    const today = new Date();
    return today.getDate();
  };

  const isTodayDate = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getMonthName = (date: Date) => {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTaskColor = (category: CalendarTask['category'], status: CalendarTask['status']) => {
    const colors = {
      design: {
        todo: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
        done: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        inprogress: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
      },
      development: {
        todo: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
        done: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        inprogress: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
      },
      research: {
        todo: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
        done: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        inprogress: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
      }
    };

    return colors[category][status];
  };

  const getDotColor = (category: CalendarTask['category']) => {
    const colors = {
      design: 'bg-blue-500',
      development: 'bg-emerald-500',
      research: 'bg-amber-500'
    };
    return colors[category];
  };

  const getTaskBorderRadius = (task: CalendarTask) => {
    if (task.isSpanStart) return 'rounded-md rounded-r-none';
    if (task.isSpanEnd) return 'rounded-md rounded-l-none';
    if (task.isSpanning) return 'rounded-none';
    return 'rounded-md';
  };

  const getTaskBorder = (task: CalendarTask) => {
    if (task.isSpanStart) return 'border-y border-l';
    if (task.isSpanEnd) return 'border-y border-r';
    if (task.isSpanning) return 'border-y';
    return 'border';
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = getToday(); // Dynamic today

    // Previous month padding (faded dates)
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
      const day = prevMonthDays - firstDay + i + 1;
      days.push(
        <div key={`prev-${i}`} className="bg-slate-50/50 dark:bg-slate-900/20 p-1.5 min-h-[120px] calendar-cell group opacity-60">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-600">
              {day}
            </span>
          </div>
        </div>
      );
    }

    // Current month days (only show tasks for this month)
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isTodayDate(day);
      // Only show tasks that belong to the current month and year
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date();
        taskDate.setDate(task.date);
        return task.date === day && 
               taskDate.getMonth() === currentDate.getMonth() && 
               taskDate.getFullYear() === currentDate.getFullYear();
      });
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/50 dark:hover:bg-blue-900/20' : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/30'} p-1.5 min-h-[120px] calendar-cell group transition-colors`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white shadow-sm' : 'text-slate-700 dark:text-slate-200'}`}>
              {day}
            </span>
            {isToday && (
              <button 
                className="add-task-btn opacity-0 text-primary hover:bg-primary/10 p-1 rounded transition-all"
                onClick={() => handleCreateTask(day)}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {/* Tasks for this day (only current month) */}
          {dayTasks.map((task) => (
            <div 
              key={task.id}
              className={`px-2 py-1 mb-1 ${getTaskBorderRadius(task)} ${getTaskBorder(task)} text-xs font-medium ${getTaskColor(task.category, task.status)} truncate cursor-pointer hover:opacity-80 transition-opacity ${task.status === 'done' ? 'line-through' : ''}`}
              title={`${task.category.charAt(0).toUpperCase() + task.category.slice(1)}: ${task.title}`}
              onClick={() => handleEditTask(task)}
            >
              {!task.isSpanning && (
                <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(task.category)} inline-block mr-1`}></span>
              )}
              {task.isSpanEnd && (
                <span className="absolute right-2 top-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(task.category)} inline-block`}></span>
                </span>
              )}
              {task.isSpanning ? (task.isSpanStart ? task.title : '-') : task.title}
            </div>
          ))}
        </div>
      );
    }

    // Next month padding (faded dates)
    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="bg-slate-50/50 dark:bg-slate-900/20 p-1.5 min-h-[120px] calendar-cell group opacity-60">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-600">
              {i}
            </span>
          </div>
        </div>
      );
    }

    // Add extra rows for months that need 6 rows (like months with 31 days starting on Saturday)
    const totalRows = Math.ceil(days.length / 7);
    const neededRows = 6; // Always show 6 rows for consistency
    
    if (totalRows < neededRows) {
      const cellsNeeded = (neededRows - totalRows) * 7;
      for (let i = 1; i <= cellsNeeded; i++) {
        days.push(
          <div key={`extra-${i}`} className="bg-slate-50/50 dark:bg-slate-900/20 p-1.5 min-h-[120px] calendar-cell group opacity-60">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-600">
                {' '}
              </span>
            </div>
          </div>
        );
      }
    }

    return days;
  };

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Project Calendar</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">มุมมองปฏิทินสำหรับจัดการตารางงาน</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" title="Kanban View">
              <LayoutDashboard className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" title="List View">
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-colors" title="Calendar View">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

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
          
          <Button 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm active:scale-95"
            onClick={() => handleCreateTask()}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้างงานใหม่</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 w-full max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-80px)]">
        
        {/* Calendar Container */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
          
          {/* Calendar Toolbar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold tracking-tight w-40">{getMonthName(currentDate)}</h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Filters */}
              <select className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary outline-none transition-shadow text-slate-700 dark:text-slate-200 cursor-pointer">
                <option>หมวดหมู่ทั้งหมด</option>
                <option>Design</option>
                <option>Development</option>
                <option>Research</option>
              </select>
              
              {/* Navigation Controls */}
              <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors rounded-none border-r border-slate-200 dark:border-slate-800"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors rounded-none border-r border-slate-200 dark:border-slate-800"
                  onClick={goToToday}
                >
                  วันนี้
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors rounded-none"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">อา.</div>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">จ.</div>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">อ.</div>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">พ.</div>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">พฤ.</div>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">ศ.</div>
            <div className="bg-slate-50 dark:bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">ส.</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 grid-rows-6 overflow-hidden">
            {renderCalendarDays()}
          </div>
        </div>
      </main>
      
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedDate(null);
        }}
        mode={dialogMode}
        task={selectedTask ? {
          ...selectedTask,
          column: selectedTask.status,
          description: selectedTask.description || ''
        } : undefined}
        onSave={handleSaveTask}
        columns={[
          { id: 'todo', title: 'To Do' },
          { id: 'inprogress', title: 'In Progress' },
          { id: 'review', title: 'Review' },
          { id: 'done', title: 'Done' }
        ]}
      />
    </div>
  );
}
