import { getTasks } from '@/lib/actions/task';
import ReportDashboard from '@/components/kanban/report/report-dashboard';

export default async function ReportPage() {
  // ดึงข้อมูลจริงจาก Database ในตอนแรก
  const dbTasks = await getTasks({ includeHidden: true });

  // โยนข้อมูลให้ Component ไปจัดการ UI ต่อ
  return <ReportDashboard dbTasks={dbTasks} />;
}
