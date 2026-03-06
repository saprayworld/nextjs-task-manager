'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Moon, 
  Sun, 
  Plus, 
  MoreHorizontal, 
  LayoutList,
  LayoutDashboard,
  ChevronDown,
  Clock,
  SearchX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  category: 'design' | 'research' | 'development';
  assignees: Array<{ name: string; avatar?: string; initials?: string }>;
  dueDate?: string;
  completed?: boolean;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'ออกแบบ UI หน้า About Us',
    description: 'จัดวางโครงสร้างหน้าเพจใหม่ให้เข้ากับธีมของธุรกิจ เน้นความเรียบหรู',
    status: 'todo',
    category: 'design',
    assignees: [
      { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=11' },
      { name: 'Mark Smith', avatar: 'https://i.pravatar.cc/150?img=32' }
    ]
  },
  {
    id: '2',
    title: 'วิเคราะห์คู่แข่งในตลาด',
    description: 'รวบรวมข้อมูลฟีเจอร์เด่นๆ ของระบบจัดการโปรเจกต์ 3 เจ้าหลัก',
    status: 'todo',
    category: 'research',
    assignees: [
      { name: 'John Snow', initials: 'JS' }
    ],
    dueDate: 'วันนี้'
  },
  {
    id: '3',
    title: 'พัฒนาระบบ Drag & Drop',
    description: 'เขียนสคริปต์ให้สามารถย้ายการ์ดข้ามคอลัมน์ได้ด้วย HTML5 API',
    status: 'inprogress',
    category: 'development',
    assignees: [
      { name: 'Alex Dev', avatar: 'https://i.pravatar.cc/150?img=33' }
    ],
    dueDate: '12 มี.ค. 2024'
  },
  {
    id: '4',
    title: 'สร้าง Wireframe หน้าแรก',
    description: '',
    status: 'done',
    category: 'design',
    assignees: [
      { name: 'Jane Doe', avatar: 'https://i.pravatar.cc/150?img=11' }
    ],
    dueDate: '5 มี.ค. 2024',
    completed: true
  }
];

export default function TaskListPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tasks, searchTerm, statusFilter, categoryFilter]);

  const getStatusBadge = (status: Task['status']) => {
    const statusConfig = {
      todo: {
        label: 'To Do',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        dotColor: 'bg-slate-500'
      },
      inprogress: {
        label: 'In Progress',
        className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30',
        dotColor: 'bg-blue-600 dark:bg-blue-500 animate-pulse'
      },
      review: {
        label: 'Review',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        dotColor: 'bg-amber-500'
      },
      done: {
        label: 'Done',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dotColor: 'bg-emerald-500'
      }
    };

    const config = statusConfig[status];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
        {config.label}
      </span>
    );
  };

  const getCategoryBadge = (category: Task['category'], status?: Task['status']) => {
    const categoryConfig = {
      design: {
        label: 'Design',
        className: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
      },
      research: {
        label: 'Research',
        className: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
      },
      development: {
        label: 'Development',
        className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
      }
    };

    const config = categoryConfig[category];
    
    return (
      <span className={`text-[10px] font-semibold tracking-wider uppercase ${config.className} px-2 py-1 rounded-md ${category === 'design' && status === 'done' ? 'opacity-70' : ''}`}>
        {config.label}
      </span>
    );
  };

  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return '-';
    
    if (dueDate === 'วันนี้') {
      return (
        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {dueDate}
        </span>
      );
    }
    
    return <span className="text-slate-500 dark:text-slate-400">{dueDate}</span>;
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed, status: task.completed ? 'todo' as Task['status'] : 'done' as Task['status'] }
          : task
      )
    );
  };

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'inprogress').length;

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <LayoutList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Project Tasks</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">รายการงานและโปรเจกต์ทั้งหมด</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800">
            <Button variant="ghost" size="sm" className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" title="Kanban View">
              <LayoutDashboard className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1.5 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm transition-colors" title="List View">
              <LayoutList className="w-4 h-4" />
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
          
          <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm active:scale-95">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้างงานใหม่</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Page Title & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">รายการงานทั้งหมด</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              คุณมีงานที่กำลังดำเนินการอยู่ {inProgressCount} งาน และงานที่ต้องทำอีก {todoCount} งาน
            </p>
          </div>
          
          {/* Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="ค้นหาชื่องาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow text-slate-700 dark:text-slate-200"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-auto flex-1 sm:flex-none">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="inprogress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-auto flex-1 sm:flex-none">
                <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-medium">ชื่องาน</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">สถานะ</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">หมวดหมู่</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">ผู้รับผิดชอบ</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">วันกำหนดส่ง</th>
                  <th scope="col" className="px-6 py-3.5 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr 
                      key={task.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTaskComplete(task.id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary dark:bg-slate-900 cursor-pointer"
                          />
                          <div>
                            <p className={`font-medium text-slate-900 dark:text-slate-100 ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getCategoryBadge(task.category, task.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {task.assignees.map((assignee, index) => (
                            <Avatar 
                              key={index} 
                              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 relative z-10 hover:z-20 transition-transform hover:scale-110 cursor-pointer"
                              title={assignee.name}
                            >
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
                      </td>
                      <td className="px-6 py-4">
                        {getDueDateDisplay(task.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                          <SearchX className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">ไม่พบงานที่ค้นหา</p>
                        <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ดูอีกครั้ง</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              แสดง {filteredTasks.length} รายการ
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                ก่อนหน้า
              </Button>
              <Button variant="outline" size="sm">
                ถัดไป
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
