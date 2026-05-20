import SettingDashboard from "@/components/kanban/setting-dashboard";
import { getCategories } from "@/lib/actions/category";
import { getUserSettings } from "@/lib/actions/setting";
import { getTrashedTasks, getArchivedTasks } from "@/lib/actions/task";

export default async function Page() {
  const [categories, settings, trashedTasks, archivedTasks] = await Promise.all([
    getCategories(),
    getUserSettings(),
    getTrashedTasks(),
    getArchivedTasks(),
  ]);

  return (
    <SettingDashboard
      initialCategories={categories}
      initialSettings={settings}
      trashCount={trashedTasks.length}
      archiveCount={archivedTasks.length}
    />
  );
}