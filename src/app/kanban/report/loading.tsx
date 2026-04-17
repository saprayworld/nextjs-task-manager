import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  CheckCircle2,
  Clock,
  Timer
} from "lucide-react";

export default function LoadingReportPage() {
  return (
    <div className="flex flex-col h-full container mx-auto p-4 md:p-6 lg:max-w-7xl animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
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
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ListTodo, iconColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", title: "งานทั้งหมด" },
          { icon: CheckCircle2, iconColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", title: "งานที่เสร็จแล้ว" },
          { icon: Clock, iconColor: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30", title: "งานที่กำลังทำ" },
          { icon: Timer, iconColor: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30", title: "เวลาทำงานรวม" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
                {idx === 1 && (
                  <Skeleton className="w-full h-1.5 mt-3 rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Time Detail List Skeleton */}
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
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-1">
                    <Skeleton className="w-5 h-5 rounded-full" />
                  </div>
                  <div className="w-full flex-1">
                    <Skeleton className="h-5 w-3/4 mb-1.5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <div className="text-right pl-4">
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Chart Placeholder Area Skeleton */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-lg text-center mb-6">สถานะงานทั้งหมด</h3>

          <div className="flex-1 flex flex-col items-center justify-center -mt-4">
            {/* Fake Donut Chart Skeleton */}
            <div className="relative flex items-center justify-center h-48 w-48">
              <Skeleton className="w-48 h-48 rounded-full" />
              <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                <div className="text-center w-full px-4 flex flex-col items-center gap-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              </div>
            </div>

            <div className="w-full space-y-4 mt-8 px-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-700 dark:text-green-400">เสร็จสิ้น (Done)</span>
                </div>
                <Skeleton className="h-4 w-10" />
              </div>

              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="font-medium text-orange-700 dark:text-orange-400">ยังไม่เสร็จ (Pending)</span>
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
