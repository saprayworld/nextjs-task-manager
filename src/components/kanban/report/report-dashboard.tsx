'use client';

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Timer,
  LayoutDashboard,
  CalendarDays
} from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("ReportDashboard");
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

  const chartConfig = {
    count: {
      label: t('chart.chartLabelCount'),
    },
    completed: {
      label: t('chart.chartLabelCompleted'),
      color: "hsl(142, 71%, 45%)", // green-500
    },
    pending: {
      label: t('chart.chartLabelPending'),
      color: "hsl(24, 95%, 53%)",  // orange-500
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => [
    { status: "completed", count: reportData.completedTasks, fill: "var(--color-completed)" },
    { status: "pending", count: reportData.pendingTasks, fill: "var(--color-pending)" },
  ], [reportData.completedTasks, reportData.pendingTasks]);

  const formatWorkTime = (timeValue: number) => {
    // ปรับ Logic นี้ตามชนิดข้อมูลจริงที่เก็บใน DB (totalWorkTime) นิยมเก็บเป็น วินาที (Seconds) หรือ นาที (Minutes)
    if (!timeValue) return `0${t('time.hours')} 0${t('time.minutes')}`;

    // สมมติว่าเก็บเป็นนาที (ถ้า DB เป็นวินาที ให้แก้เป็น Math.floor(timeValue / 3600))
    const hours = Math.floor(timeValue / 60);
    const minutes = timeValue % 60; // ถ้าเป็นวินาทีแก้เป็น Math.floor((timeValue % 3600) / 60)

    if (hours > 0) {
      return `${hours}${t('time.hours')} ${minutes}${t('time.minutes')}`;
    }
    return `${minutes}${t('time.minutes')}`;
  };

  return (
    <div className="flex flex-col h-full container mx-auto p-4 md:p-6 lg:max-w-7xl  overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <CalendarDays className="w-4 h-4" />
          <span>{t('currentData')}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{t('cards.totalTasks')}</p>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{reportData.totalTasks}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t('cards.totalTasksDesc')}</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{t('cards.completedTasks')}</p>
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
            <p className="text-sm font-medium text-muted-foreground">{t('cards.pendingTasks')}</p>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{reportData.pendingTasks}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t('cards.pendingTasksDesc')}</p>
          </div>
        </div>

        {/* Total Time */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{t('cards.totalWorkTime')}</p>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{formatWorkTime(reportData.totalWorkTime)}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t('cards.totalWorkTimeDesc')}</p>
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
                {t('timeBreakdown.title')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('timeBreakdown.description')}
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
                      {t('timeBreakdown.statusLabel')}: {task.isCompleted ? t('timeBreakdown.statusCompleted') : t('timeBreakdown.statusInProgress')}
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
                <p>{t('timeBreakdown.emptyState')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Status Donut Chart */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col">
          <h3 className="font-semibold text-lg text-center mb-2">{t('chart.title')}</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {t('chart.completedOf', { completed: reportData.completedTasks, total: reportData.totalTasks })}
          </p>

          <div className="flex-1 flex flex-col items-center justify-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: `var(--color-${name})`,
                            }}
                          />
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label}
                          </span>
                          <span className="font-mono font-bold tabular-nums text-foreground">
                            {value} {t('chart.taskUnit')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={90}
                  strokeWidth={3}
                  stroke="hsl(var(--background))"
                  paddingAngle={2}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {calculateCompletionRate()}%
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              {t('chart.centerLabel')}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="w-full space-y-3 mt-4 px-2">
              <div className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-700 dark:text-green-400">{t('chart.legendCompleted')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-700 dark:text-green-400 font-medium">{reportData.completedTasks} {t('chart.taskUnit')}</span>
                  <span className="font-bold text-green-700 dark:text-green-400">({calculateCompletionRate()}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="font-medium text-orange-700 dark:text-orange-400">{t('chart.legendPending')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 dark:text-orange-400 font-medium">{reportData.pendingTasks} {t('chart.taskUnit')}</span>
                  <span className="font-bold text-orange-700 dark:text-orange-400">({100 - calculateCompletionRate()}%)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
