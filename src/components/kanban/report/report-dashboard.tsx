'use client';

import {
  CheckCircle2,
  Clock,
  ListTodo,
  Timer,
  LayoutDashboard,
  CalendarDays
} from "lucide-react";

type TaskData = {
  id: string;
  title: string;
  columnId: string;
  progress: number | null;
  totalWorkTime: number | null;
  [key: string]: any;
};

interface ReportDashboardProps {
  dbTasks: TaskData[];
}

export default function ReportDashboard({ dbTasks }: ReportDashboardProps) {
  const totalTasks = dbTasks.length;
  // ถือว่า columnId === 'done' หรือ progress >= 100 คืองานที่เสร็จแล้ว
  const completedTasks = dbTasks.filter(t => t.columnId === 'done' || (t.progress && t.progress >= 100)).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalWorkTime = dbTasks.reduce((acc, curr) => acc + (curr.totalWorkTime || 0), 0);

  const taskTimeBreakdown = dbTasks
    .filter(t => (t.totalWorkTime || 0) > 0)
    .map(t => ({
      id: t.id,
      title: t.title,
      totalWorkTime: t.totalWorkTime || 0,
      isCompleted: t.columnId === 'done' || (t.progress && t.progress >= 100)
    }));

  const reportData = {
    totalTasks,
    completedTasks,
    pendingTasks,
    totalWorkTime,
    taskTimeBreakdown
  };

  const calculateCompletionRate = () => {
    if (reportData.totalTasks === 0) return 0;
    return Math.round((reportData.completedTasks / reportData.totalTasks) * 100);
  };

  const formatWorkTime = (timeValue: number) => {
    // ปรับ Logic นี้ตามชนิดข้อมูลจริงที่เก็บใน DB (totalWorkTime) นิยมเก็บเป็น วินาที (Seconds) หรือ นาที (Minutes)
    if (!timeValue) return "0h 0m";

    // สมมติว่าเก็บเป็นนาที (ถ้า DB เป็นวินาที ให้แก้เป็น Math.floor(timeValue / 3600))
    const hours = Math.floor(timeValue / 60);
    const minutes = timeValue % 60; // ถ้าเป็นวินาทีแก้เป็น Math.floor((timeValue % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="flex flex-col h-full container mx-auto p-4 md:p-6 lg:max-w-7xl  overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายงานและสถิติ (Report)</h1>
          <p className="text-muted-foreground mt-1">
            สรุปผลการทำงานและเวลาที่ใช้ (คำนวณจากข้อมูล totalWorkTime)
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <CalendarDays className="w-4 h-4" />
          <span>ข้อมูล ณ ปัจจุบัน</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">งานทั้งหมด</p>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{reportData.totalTasks}</h2>
            <p className="text-xs text-muted-foreground mt-1">จำนวนงานในระบบทั้งหมด</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">งานที่เสร็จแล้ว</p>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{reportData.completedTasks}</h2>
              <span className="text-sm text-green-500 font-medium">({calculateCompletionRate()}%)</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${calculateCompletionRate()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">งานที่กำลังทำ</p>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{reportData.pendingTasks}</h2>
            <p className="text-xs text-muted-foreground mt-1">งานที่รอการดำเนินการ</p>
          </div>
        </div>

        {/* Total Time */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">เวลาทำงานรวม</p>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{formatWorkTime(reportData.totalWorkTime)}</h2>
            <p className="text-xs text-muted-foreground mt-1">รวมเฉพาะงานที่มีบันทึกเวลา</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Time Detail List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-purple-500" />
                รายละเอียดเวลาทำงาน (รายชิ้นงาน)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                แสดงงานที่มีค่า totalWorkTime มากกว่า 0 เรียงตามเวลาที่ใช้
              </p>
            </div>
          </div>
          <div className="divide-y divide-border/50 flex-1 overflow-y-auto" style={{ maxHeight: '450px' }}>
            {/* Sort by totalWorkTime descending */}
            {reportData.taskTimeBreakdown.sort((a, b) => b.totalWorkTime - a.totalWorkTime).map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm md:text-base group-hover:text-primary transition-colors">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      สถานะ: {task.isCompleted ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                    </p>
                  </div>
                </div>
                <div className="text-right pl-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-sm font-medium border border-border/50 text-foreground">
                    <Timer className="w-3.5 h-3.5 text-purple-500" />
                    {formatWorkTime(task.totalWorkTime)}
                  </span>
                </div>
              </div>
            ))}

            {reportData.taskTimeBreakdown.length === 0 && (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Timer className="w-12 h-12 mb-3 text-muted-foreground/30" />
                <p>ไม่มีงานที่มีการบันทึกเวลา (totalWorkTime = 0)</p>
              </div>
            )}
          </div>
        </div>

        {/* Visual Chart Placeholder Area */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-lg text-center mb-6">สถานะงานทั้งหมด</h3>

          <div className="flex-1 flex flex-col items-center justify-center -mt-4">
            {/* Fake Donut Chart styling */}
            <div className="relative w-48 h-48 rounded-full border-[20px] border-muted flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 rounded-full border-[20px] border-purple-500 border-t-transparent border-l-transparent -rotate-45 transition-transform duration-1000 hover:scale-105 cursor-default"></div>
              <div className="absolute inset-0 rounded-full border-[20px] border-green-500 border-b-transparent border-r-transparent rotate-12 transition-transform duration-1000 hover:scale-105 cursor-default"></div>

              <div className="text-center z-10">
                <span className="text-3xl font-bold">{reportData.completedTasks}</span>
                <span className="text-xs block text-muted-foreground mt-1 font-medium">งานเสร็จแล้ว</span>
              </div>
            </div>

            <div className="w-full space-y-4 mt-8 px-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-700 dark:text-green-400">เสร็จสิ้น (Done)</span>
                </div>
                <span className="font-bold text-green-700 dark:text-green-400">{calculateCompletionRate()}%</span>
              </div>

              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="font-medium text-orange-700 dark:text-orange-400">ยังไม่เสร็จ (Pending)</span>
                </div>
                <span className="font-bold text-orange-700 dark:text-orange-400">{100 - calculateCompletionRate()}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
